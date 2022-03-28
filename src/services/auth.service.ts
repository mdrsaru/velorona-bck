import { inject, injectable } from 'inversify';

import { TYPES } from '../types';
import constants, { TokenType, Role as RoleEnum, UserStatus, InvitationStatus } from '../config/constants';
import { NotAuthenticatedError } from '../utils/api-error';
import strings from '../config/strings';
import User from '../entities/user.entity';
import * as apiError from '../utils/api-error';

import {
  IAuthService,
  IForgotPasswordInput,
  ILoginInput,
  IResetPasswordInput,
  ILoginResponse,
  IResetPasswordResponse,
  IForgotPasswordResponse,
  IInvitationRegisterInput,
  IInvitationRegisterResponse,
} from '../interfaces/auth.interface';
import { IEmailService, IEntityID, IHashService, ITokenService, ILogger } from '../interfaces/common.interface';
import { IUserRepository } from '../interfaces/user.interface';
import { IUserTokenService } from '../interfaces/user-token.interface';
import { IRoleRepository } from '../interfaces/role.interface';
import { IInvitationRepository } from '../interfaces/invitation.interface';

@injectable()
export default class AuthService implements IAuthService {
  private name = 'AuthService';
  private userRepository: IUserRepository;
  private hashService: IHashService;
  private tokenService: ITokenService;
  private emailService: IEmailService;
  private userTokenService: IUserTokenService;
  private roleRepository: IRoleRepository;
  private invitationRepository: IInvitationRepository;
  private logger: ILogger;

  constructor(
    @inject(TYPES.UserRepository) _userRepository: IUserRepository,
    @inject(TYPES.HashService) _hashService: IHashService,
    @inject(TYPES.TokenService) _tokenService: ITokenService,
    @inject(TYPES.EmailService) _emailService: IEmailService,
    @inject(TYPES.UserTokenService) userTokenService: IUserTokenService,
    @inject(TYPES.LoggerFactory) loggerFactory: (name: string) => ILogger,
    @inject(TYPES.RoleRepository) _roleRepository: IRoleRepository,
    @inject(TYPES.InvitationRepository) _invitationRepository: IInvitationRepository
  ) {
    this.userRepository = _userRepository;
    this.hashService = _hashService;
    this.tokenService = _tokenService;
    this.emailService = _emailService;
    this.userTokenService = userTokenService;
    this.logger = loggerFactory(this.name);
    this.roleRepository = _roleRepository;
    this.invitationRepository = _invitationRepository;
  }

  login = async (args: ILoginInput): Promise<ILoginResponse> => {
    try {
      const email = args.email?.toLowerCase()?.trim();
      const password = args.password;
      const clientCode = args.clientCode;

      let user: User | undefined;

      if (clientCode) {
        user = await this.userRepository.getByEmailAndClientCode({
          email,
          clientCode,
          relations: ['roles', 'client'],
        });
      } else {
        user = await this.userRepository.getByEmailAndNoClient({
          email,
          relations: ['roles', 'client'],
        });

        // check if the user is associated to client(fallback check)
        if (user?.client) {
          throw new apiError.ValidationError({
            details: [strings.pleaseLoginWithClient],
          });
        }

        // System admin
        const adminObj = {
          [RoleEnum.SuperAdmin]: true,
        };

        // Check if the user trying to login has system admin roles.
        const admins = [];
        const _roles = user?.roles ?? [];
        for (let role of _roles) {
          if (role.name in adminObj) {
            admins.push(role);
          }
        }

        if (!admins.length) {
          throw new NotAuthenticatedError({
            details: [strings.emailPasswordNotCorrect],
          });
        }
      }

      if (!user) {
        throw new NotAuthenticatedError({
          details: [strings.emailPasswordNotCorrect],
        });
      }

      const userPassword: any = user.password;

      let isPasswordCorrect = await this.hashService.compare(password, userPassword);
      if (!isPasswordCorrect) {
        throw new NotAuthenticatedError({
          details: [strings.emailPasswordNotCorrect],
        });
      }

      let payload = {
        id: user?.id,
        roles: user.roles.map((role) => role.id),
      };

      let token = await this.tokenService.generateToken({
        payload: payload,
        tokenSecret: constants.accessTokenSecret,
        tokenLife: constants.accessTokenLife,
      });

      let userToken = await this.userTokenService.create({
        payload,
        secretKey: constants.refreshTokenSecret,
        user_id: user.id,
        expiresIn: constants.refreshTokenExpiration,
        tokenType: TokenType?.refresh,
      });

      return {
        id: user.id,
        token: token,
        roles: user.roles,
        refreshToken: userToken.token,
        client: user.client,
      };
    } catch (err) {
      throw err;
    }
  };

  forgotPassword = async (args: IForgotPasswordInput): Promise<IForgotPasswordResponse> => {
    throw new apiError.NotImplementedError({
      details: ['Not implemented'],
    });
  };

  resetPassword = async (args: IResetPasswordInput): Promise<IResetPasswordResponse> => {
    try {
      const token = await this.tokenService.extractToken(args.token);
      const password = args.password;
      const tokenData = {
        token: token,
        secretKey: constants.accessTokenSecret,
      };

      const result = await this.tokenService.verifyToken(tokenData);

      if (result) {
        const id = result.id;
        await this.userRepository.update({
          id,
          password: password,
        });

        return {
          message: 'Password changed sucessfully',
        };
      } else {
        throw new NotAuthenticatedError({ details: ['Invalid Token'] });
      }
    } catch (err) {
      throw err;
    }
  };

  renewAccessToken = async (refreshToken: string): Promise<ILoginResponse> => {
    const operation = 'renewAccessToken';

    try {
      const userToken = await this.userTokenService.getByToken(refreshToken);
      if (!userToken) {
        throw new apiError.ValidationError({
          details: [strings.tokenInvalid],
        });
      }

      const token = userToken.token;

      const decoded: any = await this.tokenService
        .verifyToken({
          token,
          secretKey: constants.refreshTokenSecret,
        })
        .catch((err) =>
          this.logger.error({
            operation,
            message: 'Invalid refresh token',
            data: err,
          })
        );

      if (!decoded) {
        throw new apiError.ValidationError({
          details: [strings.tokenInvalid],
          data: {},
        });
      }

      const payload = {
        id: decoded.id,
        roles: decoded?.roles ?? [],
      };

      const newAccessToken = await this.tokenService.generateToken({
        payload,
        tokenSecret: constants.accessTokenSecret,
        tokenLife: constants.accessTokenLife,
      });

      const user = await this.userRepository.getById({
        id: decoded.id,
        relations: ['roles', 'client'],
      });

      return {
        id: payload.id,
        token: newAccessToken,
        refreshToken,
        roles: user?.roles ?? [],
        client: user?.client,
      };
    } catch (err) {
      throw err;
    }
  };

  logout = async (refreshToken: string): Promise<boolean> => {
    const operation = 'logout';

    return this.userTokenService
      .deleteByToken({
        token: refreshToken,
      })
      .then((data) => (data ? true : false));
  };

  registerWithInvitation = async (args: IInvitationRegisterInput): Promise<IInvitationRegisterResponse> => {
    const operation = 'registerWithInvitation';

    try {
      const token = args.token;
      const password = args.password;
      const firstName = args.firstName;
      const lastName = args.lastName;
      const middleName = args.middleName;
      const phone = args.phone;
      const address = args.address;
      const record = args.record;
      const status = UserStatus.Active;

      const invitation = await this.invitationRepository.getSingleEntity({
        query: { token },
      });

      if (!invitation) {
        throw new apiError.NotFoundError({
          details: [strings.invitationNotFound],
        });
      }

      const role = invitation.role;
      const email = invitation.email;
      const client_id = invitation.client_id;
      const expiresIn = invitation.expiresIn;

      if (new Date() > expiresIn) {
        throw new apiError.ValidationError({
          details: [strings.invitationExpired],
        });
      }

      if (!client_id) {
        throw new apiError.ValidationError({
          details: [strings.clientNotFound],
        });
      }

      const roles = await this.roleRepository.getAll({
        query: {
          name: role,
        },
      });

      const user = await this.userRepository.create({
        email,
        password,
        firstName,
        lastName,
        middleName,
        phone,
        status,
        address,
        record,
        client_id,
        roles: roles.map((r) => r.id),
      });

      await this.invitationRepository.update({
        id: invitation.id,
        status: InvitationStatus.Approved,
      });

      this.logger.info({
        operation,
        message: 'Invitation approved',
        data: { id: invitation.id, client_id, email },
      });

      return {
        id: user.id,
      };
    } catch (err) {
      throw err;
    }
  };
}
