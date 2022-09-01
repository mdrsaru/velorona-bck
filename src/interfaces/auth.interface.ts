import Role from '../entities/role.entity';
import Company from '../entities/company.entity';
import { ForgotPasswordUserType, EntryType } from '../config/constants';

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

export interface IResendInvitation {
  user_id: string;
  company_id: string;
}

export interface IResetPasswordInput {
  token?: any;
  password: string;
}

export interface IChangePasswordInput {
  user_id: string;
  oldPassword: string;
  newPassword: string;
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
  entryType?: EntryType;
}
export interface IResendInvitationResponse {
  message: string;
}
export interface IForgotPasswordResponse {
  token: string | undefined;
}

export interface IResetPasswordResponse {
  message: string;
}
export interface IChangePasswordResponse {
  message: string;
}
export interface IAuthService {
  login(args: ILoginInput): Promise<ILoginResponse>;
  forgotPassword(args: IForgotPasswordInput): Promise<IForgotPasswordResponse>;
  resetPassword(args: IResetPasswordInput): Promise<IResetPasswordResponse>;
  resendInvitation(args: IResendInvitation): Promise<IResendInvitationResponse>;
  changePassword(args: IChangePasswordInput): Promise<IChangePasswordResponse>;
  renewAccessToken(refreshToken: string): Promise<ILoginResponse>;
  logout(refreshToken: string): Promise<boolean>;
}

export interface IUserAuth {
  id: string;
  roles: Role[];
}
