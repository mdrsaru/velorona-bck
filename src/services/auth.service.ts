import { inject, injectable } from 'inversify';

import { TYPES } from '../types';
import constants, {
  TokenType,
  Role as RoleEnum,
  UserStatus,
  ForgotPasswordUserType,
  emailSetting,
  CompanyStatus,
  events,
} from '../config/constants';
import { NotAuthenticatedError, ValidationError } from '../utils/api-error';
import strings from '../config/strings';
import User from '../entities/user.entity';
import * as apiError from '../utils/api-error';
import { generateRandomStrings, generateRandomToken } from '../utils/strings';

import {
  IAuthService,
  IForgotPasswordInput,
  ILoginInput,
  IResetPasswordInput,
  ILoginResponse,
  IResetPasswordResponse,
  IForgotPasswordResponse,
  IChangePasswordInput,
  IChangePasswordResponse,
  IResendInvitation,
  IResendInvitationResponse,
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
import { ICompanyRepository } from '../interfaces/company.interface';
import userEmitter from '../subscribers/user.subscriber';

@injectable()
export default class AuthService implements IAuthService {
  private name = 'AuthService';
  private userRepository: IUserRepository;
  private hashService: IHashService;
  private tokenService: ITokenService;
  private emailService: IEmailService;
  private userTokenService: IUserTokenService;
  private roleRepository: IRoleRepository;
  private companyRepository: ICompanyRepository;
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
    @inject(TYPES.CompanyRepository) _companyRepository: ICompanyRepository,
    @inject(TYPES.HandlebarsService) _handlebarsService: ITemplateService
  ) {
    this.userRepository = _userRepository;
    this.hashService = _hashService;
    this.tokenService = _tokenService;
    this.emailService = _emailService;
    this.userTokenService = userTokenService;
    this.logger = loggerFactory(this.name);
    this.roleRepository = _roleRepository;
    this.companyRepository = _companyRepository;
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
          relations: ['roles', 'company', 'avatar'],
        });

        if (user?.company?.archived) {
          throw new apiError.NotAuthenticatedError({
            details: [strings.companyArchived],
          });
        }

        if (user?.company?.status === CompanyStatus.Unapproved) {
          throw new apiError.NotAuthenticatedError({
            details: [strings.companyNotApproved],
          });
        }

        if (user?.company?.status === CompanyStatus.Inactive) {
          throw new apiError.NotAuthenticatedError({
            details: [strings.companyInactive],
          });
        }
      } else {
        user = await this.userRepository.getByEmailAndNoCompany({
          email,
          relations: ['roles', 'company', 'avatar'],
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
          details: [strings.userArchived],
          data: {
            archived: true,
          },
        });
      }

      if (user.status == UserStatus.Inactive) {
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

      if (user && !user?.loggedIn) {
        await this.userRepository.update({
          id: user?.id,
          loggedIn: true,
          status: UserStatus.Active,
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
        firstName: user.firstName,
        middleName: user?.middleName,
        lastName: user.lastName,
        avatar: user?.avatar,
        entryType: user.entryType,
      };
    } catch (err) {
      throw err;
    }
  };

  resendInvitation = async (args: IResendInvitation): Promise<IResendInvitationResponse> => {
    const operation = 'Resend Invitation';

    try {
      const user_id = args.user_id;
      const company_id = args.company_id;

      let user = await this.userRepository.getById({ id: user_id });

      if (user?.loggedIn) {
        throw new apiError.ConflictError({ details: ['User has already logged in'] });
      }
      const password = generateRandomStrings({ length: 8 });

      await this.userRepository.update({
        id: user_id,
        password,
      });
      // Emit event for onUserCreate
      userEmitter.emit(events.onUserCreate, {
        company_id,
        user: user,
        password,
      });

      return {
        message: 'Invitation sent successfully',
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

      const emailBody: string = emailSetting.resetPassword.body;
      const resetPasswordLink = `${constants.frontendUrl}/reset-password?token=${token}`;
      const resetPasswordHtml = this.handlebarsService.compile({
        template: emailBody,
        data: {
          resetPasswordLink,
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

  changePassword = async (args: IChangePasswordInput): Promise<IChangePasswordResponse> => {
    try {
      const user_id = args.user_id;
      const oldPassword = args.oldPassword;
      const newPassword = args.newPassword;

      let user = await this.userRepository.getById({ id: user_id });

      let compare;
      if (user) {
        compare = await this.hashService.compare(oldPassword, user?.password);
        if (compare) {
          await this.userRepository.update({ id: user.id, password: newPassword });
        } else {
          throw new ValidationError({ details: ['You enter the wrong old password'] });
        }
      }
      return {
        message: 'Password changed sucessfully',
      };
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

      const user: any = await this.userRepository.getById({
        id: decoded.id,
        relations: ['roles', 'company', 'avatar', 'company.logo'],
      });

      if (!user) {
        throw new apiError.NotFoundError({
          details: [strings.userNotFound],
        });
      }

      return {
        id: payload.id,
        token: newAccessToken,
        refreshToken,
        roles: user.roles ?? [],
        company: user.company,
        firstName: user.firstName,
        middleName: user?.middleName,
        lastName: user?.lastName,
        avatar: user?.avatar,
        entryType: user.entryType,
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
