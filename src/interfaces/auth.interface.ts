import User from '../entities/user.entity';
import Role from '../entities/role.entity';
import { IEntityID } from './common.interface';

export interface ILoginInput {
  email: string;
  password: string;
  clientCode?: string;
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
  refreshToken: string;
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
  renewAccessToken(refreshToken: string): Promise<ILoginResponse>;
  logout(refreshToken: string): Promise<boolean>;
}

export interface IUserAuth {
  id: string;
  roles: Role[];
}
