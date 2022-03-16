import { inject, injectable } from 'inversify';

import { TYPES } from '../types';
import constants, { TokenType } from '../config/constants';
import { NotAuthenticatedError } from '../utils/api-error';
import strings from '../config/strings';

import {
  IAuthService,
  IForgotPasswordInput,
  ILoginInput,
  IResetPasswordInput,
  ILoginResponse,
  IResetPasswordResponse,
  IForgotPasswordResponse,
} from '../interfaces/auth.interface';
import { IEmailService, IEntityID, IHashService, ITokenService, ILogger } from '../interfaces/common.interface';
import { IUserRepository } from '../interfaces/user.interface';
import { IUserTokenService } from '../interfaces/user-token.interface';
import { IRoleRepository } from '../interfaces/role.interface';

import User from '../entities/user.entity';
import * as apiError from '../utils/api-error';

@injectable()
export default class AuthService implements IAuthService {
  private name = 'AuthService';
  private userRepository: IUserRepository;
  private hashService: IHashService;
  private tokenService: ITokenService;
  private emailService: IEmailService;
  private userTokenService: IUserTokenService;
  private roleRepository: IRoleRepository;
  private logger: ILogger;

  constructor(
    @inject(TYPES.UserRepository) _userRepository: IUserRepository,
    @inject(TYPES.HashService) _hashService: IHashService,
    @inject(TYPES.TokenService) _tokenService: ITokenService,
    @inject(TYPES.EmailService) _emailService: IEmailService,
    @inject(TYPES.UserTokenService) userTokenService: IUserTokenService,
    @inject(TYPES.LoggerFactory) loggerFactory: (name: string) => ILogger,
    @inject(TYPES.RoleRepository) _roleRepository: IRoleRepository
  ) {
    this.userRepository = _userRepository;
    this.hashService = _hashService;
    this.tokenService = _tokenService;
    this.emailService = _emailService;
    this.userTokenService = userTokenService;
    this.logger = loggerFactory(this.name);
    this.roleRepository = _roleRepository;
  }

  login = async (args: ILoginInput): Promise<ILoginResponse> => {
    try {
      const email = args.email;
      const password = args.password;
      let user = await this.userRepository.getByEmail({
        email,
        relations: ['roles'],
      });

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
      };
    } catch (err) {
      throw err;
    }
  };

  forgotPassword = async (args: IForgotPasswordInput): Promise<IForgotPasswordResponse> => {
    try {
      const email = args.email;
      const baseUrl = constants.frontendUrl + '/reset-password/?token=';
      let user = await this.userRepository.getByEmail({ email });

      if (!user) {
        throw new NotAuthenticatedError({ details: ["User doesn't exist"] });
      }

      const payload = {
        id: user?.id,
      };

      const accessTokenData = {
        payload: payload,
        tokenSecret: constants.accessTokenSecret,
        tokenLife: constants.accessTokenLife,
      };

      const token = await this.tokenService.generateToken(accessTokenData);
      const mailSubject = constants.changePassword.changePasswordSubject;
      const mailBody = constants.changePassword.changePasswordBody;

      let emailData = {
        email: user.email,
        token: token,
        mailSubject,
        mailBody,
        baseUrl,
      };

      this.emailService.sendEmail(emailData);

      return {
        token: token,
      };
    } catch (err) {
      throw err;
    }
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

      const roles = await this.roleRepository.getAll({ query: { id: payload.roles } });

      return {
        id: payload.id,
        token: newAccessToken,
        refreshToken,
        roles,
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
}
