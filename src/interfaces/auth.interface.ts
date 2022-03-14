import { ForgotPasswordResponse, ResetPasswordResponse } from '../entities/auth.entity';

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
export interface IAuthService {
  login(args: ILoginInput): Promise<any>;
  forgotPassword(args: IForgotPasswordInput): Promise<ForgotPasswordResponse>;
  resetPassword(args: IResetPasswordInput): Promise<ResetPasswordResponse>;
}

export interface IUserAuth {
  id: string;
  roles: string[];
}
