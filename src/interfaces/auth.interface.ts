import User from '../entities/user.entity';
import Role from '../entities/role.entity';
import Company from '../entities/company.entity';
import { IEntityID } from './common.interface';
import { IAddressCreateInput } from './address.interface';
import { IUserRecordCreateInput } from './user-record.interface';
import { IUser } from './user.interface';

export interface ILoginInput {
  email: string;
  password: string;
  companyCode?: string;
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
  company?: Company;
}

export interface IForgotPasswordResponse {
  token: string;
}

export interface IResetPasswordResponse {
  message: string;
}

export interface IInvitationRegisterInput {
  token: string;
  password: string;
  firstName: IUser['firstName'];
  lastName: IUser['lastName'];
  middleName?: IUser['middleName'];
  phone: IUser['phone'];
  address: IAddressCreateInput;
  record: IUserRecordCreateInput;
}

export interface IInvitationRegisterResponse {
  id: string;
}

export interface IAuthService {
  login(args: ILoginInput): Promise<ILoginResponse>;
  forgotPassword(args: IForgotPasswordInput): Promise<IForgotPasswordResponse>;
  resetPassword(args: IResetPasswordInput): Promise<IResetPasswordResponse>;
  renewAccessToken(refreshToken: string): Promise<ILoginResponse>;
  logout(refreshToken: string): Promise<boolean>;
  registerWithInvitation(args: IInvitationRegisterInput): Promise<IInvitationRegisterResponse>;
}

export interface IUserAuth {
  id: string;
  roles: Role[];
}
