import { ForgotPasswordResponse, ResetPasswordResponse } from '../entities/auth.entity';
import User from '../entities/user.entity';

export interface ILoginInput {
  email: string;
  password: string;
}

export interface IForgotPasswordInput {
  email: string;
}

export interface IResetPasswordInput {
  token?: any;
  password: string;
}
export interface ITokenInput {
  token: any;
}
export interface IAuthService {
  login(args: ILoginInput): Promise<any>;
  forgotPassword(args: IForgotPasswordInput): Promise<ForgotPasswordResponse>;
  resetPassword(args: IResetPasswordInput): Promise<ResetPasswordResponse>;
  me(args: ITokenInput): Promise<User | undefined>;
}

export interface IUserAuth {
  id: string;
  roles: string[];
}
