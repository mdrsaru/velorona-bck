import { inject, injectable } from 'inversify';
import { Arg, Ctx, Mutation, Query, UseMiddleware } from 'type-graphql';

import {
  ForgotPasswordInput,
  ForgotPasswordResponse,
  LoginInput,
  LoginResponse,
  ResetPasswordInput,
  ResetPasswordResponse,
} from '../../entities/auth.entity';
import User from '../../entities/user.entity';

import { TYPES } from '../../types';
import AuthValidation from '../../validation/auth.validation';
import authenticate from '../middlewares/authenticate';

import { IErrorService, IJoiService } from '../../interfaces/common.interface';
import { IAuthService } from '../../interfaces/auth.interface';
import { IGraphqlContext } from '../../interfaces/graphql.interface';

@injectable()
export class AuthResolver {
  private name = 'AuthResolver';
  private authService: IAuthService;
  private joiService: IJoiService;
  private errorService: IErrorService;

  constructor(
    @inject(TYPES.AuthService) authService: IAuthService,
    @inject(TYPES.JoiService) _joiService: IJoiService,
    @inject(TYPES.ErrorService) _errorService: IErrorService
  ) {
    this.authService = authService;
    this.joiService = _joiService;
    this.errorService = _errorService;
  }

  @Query((returns) => User)
  @UseMiddleware(authenticate)
  async me(@Ctx() ctx: IGraphqlContext) {
    const operation = 'me';
    try {
      const token = ctx.req.headers;
      const schema = AuthValidation.me();
      await this.joiService.validate({
        schema,
        input: {
          token,
        },
      });
      const res = await this.authService.me({
        token,
      });
      return res;
    } catch (err) {
      this.errorService.throwError({ err, name: this.name, operation, logError: true });
    }
  }

  @Mutation((returns) => LoginResponse)
  async Login(@Arg('input') args: LoginInput) {
    const operation = 'Login';

    try {
      const email = args.email;
      const password = args.password;

      const schema = AuthValidation.login();
      await this.joiService.validate({
        schema,
        input: {
          email,
          password,
        },
      });

      const res = await this.authService.login({
        email,
        password,
      });

      return res;
    } catch (err) {
      this.errorService.throwError({ err, name: this.name, operation, logError: true });
    }
  }

  @Mutation((returns) => ForgotPasswordResponse)
  async ForgotPassword(@Arg('input') args: ForgotPasswordInput) {
    const operation = 'ForgetPassword';

    try {
      const email = args.email;

      const schema = AuthValidation.forgotPassword();
      await this.joiService.validate({
        schema,
        input: {
          email,
        },
      });

      const res = await this.authService.forgotPassword({
        email,
      });
      return res;
    } catch (err) {
      this.errorService.throwError({ err, name: this.name, operation, logError: true });
    }
  }

  @Mutation((returns) => ResetPasswordResponse)
  async ResetPassword(@Arg('input') args: ResetPasswordInput, @Ctx() ctx: IGraphqlContext) {
    const operation = 'ResetPassword';
    try {
      const token = ctx.req.headers;
      const password = args.password;
      const schema = AuthValidation.resetPassword();
      await this.joiService.validate({
        schema,
        input: {
          token,
          password,
        },
      });
      const res = await this.authService.resetPassword({
        token,
        password,
      });
      return res;
    } catch (err) {
      this.errorService.throwError({ err, name: this.name, operation, logError: true });
    }
  }
}
