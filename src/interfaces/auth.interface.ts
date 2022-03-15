import { ForgotPasswordResponse, ResetPasswordResponse } from '../entities/auth.entity';
import Role from '../entities/role.entity';

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

export interface ILoginResponse {
  id: string;
  token: string;
  roles: Role[];
}

export interface IForgotPasswordResponse {
  token: string;
}

export interface IResetPasswordResponse {
  message: string;
}

export interface IAuthService {
  login(args: ILoginInput): Promise<ILoginResponse>;
  forgotPassword(args: IForgotPasswordInput): Promise<IForgotPasswordResponse>;
  resetPassword(args: IResetPasswordInput): Promise<IResetPasswordResponse>;
}

export interface IUserAuth {
  id: string;
  roles: string[];
}
