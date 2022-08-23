import ms from 'ms';
import { inject, injectable } from 'inversify';
import { Arg, Ctx, FieldResolver, Mutation, Query, Resolver, Root, UseMiddleware } from 'type-graphql';
import { CookieOptions } from 'express';

import User from '../../entities/user.entity';
import strings from '../../config/strings';
import {
  ForgotPasswordInput,
  LoginInput,
  LoginResponse,
  ResetPasswordInput,
  ChangePasswordInput,
  ChangePasswordResponse,
  ResendInvitationInput,
} from '../../entities/auth.entity';

import { TYPES } from '../../types';
import constants from '../../config/constants';
import AuthValidation from '../../validation/auth.validation';
import authenticate from '../middlewares/authenticate';

import { IErrorService, IJoiService } from '../../interfaces/common.interface';
import { IAuthService } from '../../interfaces/auth.interface';
import { IGraphqlContext } from '../../interfaces/graphql.interface';
import { IUserService } from '../../interfaces/user.interface';
import { checkCompanyAccess } from '../middlewares/company';

@injectable()
@Resolver((of) => LoginResponse)
export class AuthResolver {
  private name = 'AuthResolver';
  private authService: IAuthService;
  private joiService: IJoiService;
  private errorService: IErrorService;
  private userService: IUserService;

  constructor(
    @inject(TYPES.AuthService) authService: IAuthService,
    @inject(TYPES.JoiService) _joiService: IJoiService,
    @inject(TYPES.ErrorService) _errorService: IErrorService,
    @inject(TYPES.UserService) userService: IUserService
  ) {
    this.authService = authService;
    this.joiService = _joiService;
    this.errorService = _errorService;
    this.userService = userService;
  }

  @Query((returns) => User)
  @UseMiddleware(authenticate)
  async me(@Ctx() ctx: IGraphqlContext) {
    const operation = 'me';
    try {
      const id: any = ctx.user?.id;
      const res = await this.userService.getById({
        id,
      });
      return res;
    } catch (err) {
      this.errorService.throwError({
        err,
        name: this.name,
        operation,
        logError: true,
      });
    }
  }

  @Mutation((returns) => LoginResponse)
  async Login(@Arg('input') args: LoginInput, @Ctx() ctx: IGraphqlContext) {
    const operation = 'Login';

    try {
      const email = args.email;
      const password = args.password;
      const companyCode = args?.companyCode;

      const schema = AuthValidation.login();
      await this.joiService.validate({
        schema,
        input: {
          email,
          password,
          companyCode,
        },
      });

      const loginResponse = await this.authService.login({
        email,
        password,
        companyCode,
      });

      const options: CookieOptions = {
        maxAge: ms(constants.refreshTokenExpiration),
        httpOnly: true,
      };

      ctx.res.cookie(constants.refreshTokenCookieName, loginResponse.refreshToken, options);

      return loginResponse;
    } catch (err) {
      this.errorService.throwError({
        err,
        name: this.name,
        operation,
        logError: true,
      });
    }
  }

  @Mutation((returns) => String)
  @UseMiddleware(authenticate, checkCompanyAccess)
  async ResendInvitation(@Arg('input') args: ResendInvitationInput) {
    const operation = 'ForgotPassword';

    try {
      const user_id = args.user_id;
      const company_id = args.company_id;

      const schema = AuthValidation.resendInvitation();
      await this.joiService.validate({
        schema,
        input: {
          user_id,
          company_id,
        },
      });

      const result = await this.authService.resendInvitation({
        user_id,
        company_id,
      });

      return strings.forgotPasswordMsg;
    } catch (err) {
      this.errorService.throwError({
        err,
        name: this.name,
        operation,
        logError: true,
      });
    }
  }

  @Mutation((returns) => String)
  async ForgotPassword(@Arg('input') args: ForgotPasswordInput) {
    const operation = 'ForgotPassword';

    try {
      const email = args.email;
      const userType = args.userType;
      const companyCode = args.companyCode;

      const schema = AuthValidation.forgotPassword();
      await this.joiService.validate({
        schema,
        input: {
          email,
          userType,
          companyCode,
        },
      });

      const result = await this.authService.forgotPassword({
        email,
        userType,
        companyCode,
      });

      return strings.forgotPasswordMsg;
    } catch (err) {
      this.errorService.throwError({
        err,
        name: this.name,
        operation,
        logError: true,
      });
    }
  }

  @Mutation((returns) => String)
  async ResetPassword(@Arg('input') args: ResetPasswordInput, @Ctx() ctx: IGraphqlContext) {
    const operation = 'ResetPassword';
    try {
      const token = args.token;
      const password = args.password;

      const schema = AuthValidation.resetPassword();
      await this.joiService.validate({
        schema,
        input: {
          token,
          password,
        },
      });

      const result = await this.authService.resetPassword({
        token,
        password,
      });

      return result.message;
    } catch (err) {
      this.errorService.throwError({
        err,
        name: this.name,
        operation,
        logError: true,
      });
    }
  }

  @Mutation((returns) => ChangePasswordResponse)
  async ChangePassword(@Arg('input') args: ChangePasswordInput, @Ctx() ctx: IGraphqlContext) {
    const operation = 'ChangePassword';
    try {
      const user_id = args.user_id;
      const oldPassword = args.oldPassword;
      const newPassword = args.newPassword;

      const schema = AuthValidation.changePassword();
      await this.joiService.validate({
        schema,
        input: {
          user_id,
          oldPassword,
          newPassword,
        },
      });

      const result = await this.authService.changePassword({
        user_id,
        oldPassword,
        newPassword,
      });

      return result;
    } catch (err) {
      this.errorService.throwError({
        err,
        name: this.name,
        operation,
        logError: true,
      });
    }
  }

  @Mutation((returns) => Boolean)
  @UseMiddleware(authenticate)
  async Logout(@Ctx() ctx: any): Promise<boolean> {
    const operation = 'Logout';
    try {
      const cookie = ctx.req?.cookies || {};

      const refreshToken = cookie[constants.refreshTokenCookieName];
      if (refreshToken) {
        let result = await this.authService.logout(refreshToken);
      }

      return true;
    } catch (err) {
      return true;
    }
  }

  @FieldResolver()
  fullName(@Root() root: User) {
    const middleName = root.middleName ? ` ${root.middleName}` : '';
    return `${root.firstName}${middleName} ${root.lastName}`;
  }
}
