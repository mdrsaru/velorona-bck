import { inject, injectable } from 'inversify';

import { TYPES } from '../types';
import constants, {
  TokenType,
  Role as RoleEnum,
  UserStatus,
  InvitationStatus,
  ForgotPasswordUserType,
  emailSetting,
} from '../config/constants';
import { NotAuthenticatedError, ValidationError } from '../utils/api-error';
import strings from '../config/strings';
import User from '../entities/user.entity';
import * as apiError from '../utils/api-error';
import { generateRandomToken } from '../utils/strings';

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
import {
  IEmailService,
  IEntityID,
  IHashService,
  ITokenService,
  ILogger,
  ITemplateService,
} from '../interfaces/common.interface';
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
  private handlebarsService: ITemplateService;
  private logger: ILogger;

  constructor(
    @inject(TYPES.UserRepository) _userRepository: IUserRepository,
    @inject(TYPES.HashService) _hashService: IHashService,
    @inject(TYPES.TokenService) _tokenService: ITokenService,
    @inject(TYPES.EmailService) _emailService: IEmailService,
    @inject(TYPES.UserTokenService) userTokenService: IUserTokenService,
    @inject(TYPES.LoggerFactory) loggerFactory: (name: string) => ILogger,
    @inject(TYPES.RoleRepository) _roleRepository: IRoleRepository,
    @inject(TYPES.InvitationRepository) _invitationRepository: IInvitationRepository,
    @inject(TYPES.HandlebarsService) _handlebarsService: ITemplateService
  ) {
    this.userRepository = _userRepository;
    this.hashService = _hashService;
    this.tokenService = _tokenService;
    this.emailService = _emailService;
    this.userTokenService = userTokenService;
    this.logger = loggerFactory(this.name);
    this.roleRepository = _roleRepository;
    this.invitationRepository = _invitationRepository;
    this.handlebarsService = _handlebarsService;
  }

  login = async (args: ILoginInput): Promise<ILoginResponse> => {
    try {
      const email = args.email?.toLowerCase()?.trim();
      const password = args.password;
      const companyCode = args.companyCode;

      let user: User | undefined;

      if (companyCode) {
        user = await this.userRepository.getByEmailAndCompanyCode({
          email,
          companyCode,
          relations: ['roles', 'company'],
        });

        if (user?.company?.archived) {
          throw new apiError.NotAuthenticatedError({
            details: [strings.companyArchived],
          });
        }
      } else {
        user = await this.userRepository.getByEmailAndNoCompany({
          email,
          relations: ['roles', 'company'],
        });

        // check if the user is associated to company(fallback check)
        if (user?.company) {
          throw new apiError.ValidationError({
            details: [strings.pleaseLoginWithCompany],
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

      if (user.archived) {
        throw new NotAuthenticatedError({
          details: [strings.emailPasswordNotCorrect],
          data: {
            archived: true,
          },
        });
      }

      if (user.status !== UserStatus.Active) {
        throw new NotAuthenticatedError({
          details: [strings.emailPasswordNotCorrect],
          data: {
            status: 'Inactive',
          },
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

      const refreshToken = await this.tokenService.generateToken({
        payload,
        tokenLife: constants.refreshTokenExpiration,
        tokenSecret: constants.refreshTokenSecret,
      });

      let userToken = await this.userTokenService.create({
        token: refreshToken,
        user_id: user.id,
        expiresIn: constants.refreshTokenExpiration,
        tokenType: TokenType?.refresh,
      });

      return {
        id: user.id,
        token: token,
        roles: user.roles,
        refreshToken: userToken.token,
        company: user.company,
      };
    } catch (err) {
      throw err;
    }
  };

  forgotPassword = async (args: IForgotPasswordInput): Promise<IForgotPasswordResponse> => {
    const operation = 'forgotPassword';

    try {
      const email = args.email;
      const userType = args.userType;
      const companyCode = args.companyCode;

      let user: User | undefined;
      if (userType === ForgotPasswordUserType.Company) {
        user = await this.userRepository.getByEmailAndCompanyCode({
          companyCode,
          email,
        });
      } else if (userType === ForgotPasswordUserType.SystemAdmin) {
        user = await this.userRepository.getByEmailAndNoCompany({
          email,
        });
      } else {
        throw new apiError.ValidationError({
          details: ['Invalid user type'],
        });
      }

      if (!user || user.archived) {
        return {
          token: undefined,
        };
      }

      // Clean the resetpassword token by userid
      await this.userTokenService.deleteByUserIdAndType({
        user_id: user.id,
        tokenType: TokenType.resetPassword,
      });

      const token = await generateRandomToken();
      await this.userTokenService.create({
        token,
        expiresIn: constants.forgotPasswordTokenExpiration,
        tokenType: TokenType.resetPassword,
        user_id: user.id,
      });

      let emailBody: string = emailSetting.resetPassword.body;
      const resetPasswordHtml = this.handlebarsService.compile({
        template: emailBody,
        data: {
          token,
        },
      });

      // send email asynchronously
      this.emailService
        .sendEmail({
          to: user.email,
          from: emailSetting.fromEmail,
          subject: emailSetting.resetPassword.subject,
          html: resetPasswordHtml,
        })
        .then((response) => {
          this.logger.info({
            operation,
            message: `Email response for ${user?.email}`,
            data: response,
          });
        })
        .catch((err) => {
          this.logger.error({
            operation,
            message: 'Error sending user forgot password email',
            data: err,
          });
        });

      return {
        token,
      };
    } catch (err) {
      throw err;
    }
  };

  resetPassword = async (args: IResetPasswordInput): Promise<IResetPasswordResponse> => {
    try {
      const token = args.token;
      const password = args.password;

      const userToken = await this.userTokenService.getByToken(token);

      if (!userToken || userToken.tokenType !== TokenType.resetPassword) {
        throw new apiError.ValidationError({
          details: [strings.tokenInvalid],
        });
      }

      if (userToken) {
        const id = userToken.user_id;

        if (new Date() > userToken.expiresIn) {
          throw new ValidationError({
            details: [strings.tokenExpired],
          });
        }

        await this.userRepository.update({
          id,
          password: password,
        });

        // Clean the reset password token after successful reset
        await this.userTokenService.deleteByUserIdAndType({
          user_id: id,
          tokenType: TokenType.resetPassword,
        });

        return {
          message: 'Password changed sucessfully',
        };
      } else {
        throw new NotAuthenticatedError({ details: [strings.tokenInvalid] });
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
        relations: ['roles', 'company'],
      });

      return {
        id: payload.id,
        token: newAccessToken,
        refreshToken,
        roles: user?.roles ?? [],
        company: user?.company,
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
      const company_id = invitation.company_id;
      const expiresIn = invitation.expiresIn;

      if (new Date() > expiresIn) {
        throw new apiError.ValidationError({
          details: [strings.invitationExpired],
        });
      }

      if (!company_id) {
        throw new apiError.ValidationError({
          details: [strings.companyNotFound],
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
        company_id,
        roles: roles.map((r) => r.id),
      });

      await this.invitationRepository.update({
        id: invitation.id,
        status: InvitationStatus.Approved,
      });

      this.logger.info({
        operation,
        message: 'Invitation approved',
        data: { id: invitation.id, company_id, email },
      });

      return {
        id: user.id,
      };
    } catch (err) {
      throw err;
    }
  };
}
