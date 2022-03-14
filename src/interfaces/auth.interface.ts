import { ForgotPasswordResponse, ResetPasswordResponse } from '../entities/auth.entity';

export interface ILoginInput {
  email: string;
  password: string;
}
export interface IForgotPasswordInput {
  email: string;
}

export interface IResetPasswordInput {
  token: string;
  password: string;
}
export interface IAuthService {
  login(args: ILoginInput): Promise<any>;
  forgotPassword(args: IForgotPasswordInput): Promise<ForgotPasswordResponse>;
  resetPassword(args: IResetPasswordInput): Promise<ResetPasswordResponse>;
}
