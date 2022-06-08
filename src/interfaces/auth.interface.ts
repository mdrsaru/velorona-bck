import Role from '../entities/role.entity';
import Company from '../entities/company.entity';
import { ForgotPasswordUserType } from '../config/constants';

import { IEntityID } from './common.interface';
import { IAddressCreateInput } from './address.interface';
import { IUser } from './user.interface';
import Media from '../entities/media.entity';

export interface ILoginInput {
  email: string;
  password: string;
  companyCode?: string;
}

export interface IForgotPasswordInput {
  email: string;
  userType: ForgotPasswordUserType;
  companyCode: string;
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
  company?: Company;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  avatar_id?: string;
  avatar?: Media;
}

export interface IForgotPasswordResponse {
  token: string | undefined;
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
