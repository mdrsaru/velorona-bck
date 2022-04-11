import ms from 'ms';
import { inject, injectable } from 'inversify';
import { Arg, Ctx, Mutation, Query, UseMiddleware } from 'type-graphql';
import { CookieOptions } from 'express';

import {
  ForgotPasswordInput,
  LoginInput,
  LoginResponse,
  ResetPasswordInput,
  ResetPasswordResponse,
  InvitationRegisterInput,
  InvitationRegisterResponse,
} from '../../entities/auth.entity';
import User from '../../entities/user.entity';

import { TYPES } from '../../types';
import constants from '../../config/constants';
import AuthValidation from '../../validation/auth.validation';
import authenticate from '../middlewares/authenticate';

import { IErrorService, IJoiService } from '../../interfaces/common.interface';
import { IAuthService } from '../../interfaces/auth.interface';
import { IGraphqlContext } from '../../interfaces/graphql.interface';
import { IUserService } from '../../interfaces/user.interface';

@injectable()
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

      return 'An email has been sent to reset your password if the email exists in our system.';
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

  @Mutation((returns) => InvitationRegisterResponse)
  async RegisterWithInvitation(
    @Ctx() ctx: any,
    @Arg('input') args: InvitationRegisterInput
  ): Promise<InvitationRegisterResponse> {
    const operation = 'RegisterWithInvitation';
    try {
      const token = args.token;
      const password = args.password;
      const firstName = args.firstName;
      const lastName = args.lastName;
      const middleName = args.middleName;
      const phone = args.phone;
      const address = args.address;
      const record = args.record;

      const schema = AuthValidation.registerWithInvitation();
      await this.joiService.validate({
        schema,
        input: {
          token,
          password,
          firstName,
          lastName,
          middleName,
          phone,
          address,
          record,
        },
      });

      const registeredResponse = await this.authService.registerWithInvitation({
        token,
        password,
        firstName,
        lastName,
        middleName,
        phone,
        address,
        record,
      });

      return registeredResponse;
    } catch (err) {
      this.errorService.throwError({
        err,
        name: this.name,
        operation,
        logError: true,
      });
    }
  }
}
