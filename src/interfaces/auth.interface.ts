import { ForgotPasswordResponse } from '../entities/auth.entity';

export interface ILoginInput {
  email: string;
  password: string;
}

export interface IForgotPasswordInput {
  email: string;
}

export interface IAuthService {
  login(args: ILoginInput): Promise<any>;
  forgotPassword(args: IForgotPasswordInput): Promise<ForgotPasswordResponse>;
}

export interface IUserAuth {
  id: string;
  roles: string[];
}
