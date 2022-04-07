import { IPagingArgs, IGetAllAndCountResult, IPaginationData } from './paging.interface';
import { IEntityRemove, IEntityID } from './common.interface';
import User from '../entities/user.entity';
import Role from '../entities/role.entity';
import { UserStatus } from '../config/constants';
import { IAddress, IAddressCreateInput, IAddressUpdateInput } from './address.interface';
import { IUserRecord, IUserRecordCreateInput, IUserRecordUpdateInput } from './user-record.interface';

export interface IUser {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  phone: string;
  status: UserStatus;
  address?: IAddress;
  roles: Role[];
  record?: IUserRecord;
  company_id?: string;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IEmailQuery {
  email: string;
  relations?: string[];
}

export interface IEmailCompanyQuery {
  email: string;
  companyCode: string;
  relations?: string[];
}

export interface IUserCreate {
  email: IUser['email'];
  firstName: IUser['firstName'];
  lastName: IUser['lastName'];
  middleName?: IUser['middleName'];
  phone: IUser['phone'];
  status: IUser['status'];
  roles: string[];
  company_id?: string;
  address?: IAddressCreateInput;
  record?: IUserRecordCreateInput;
}

export interface IUserCreateRepo extends IUserCreate {
  password: IUser['password'];
  archived?: IUser['archived'];
}

export interface IChangeProfilePictureInput {
  id: string;
  avatar_id: string;
}

export interface IUserUpdate {
  id: string;
  firstName?: IUser['firstName'];
  lastName?: IUser['lastName'];
  middleName?: IUser['middleName'];
  phone?: IUser['phone'];
  status?: IUser['status'];
  address?: IAddressUpdateInput;
  password?: string;
  avatar_id?: string;
  record?: IUserRecordUpdateInput;
}

export interface IUserRepository {
  getAllAndCount(args: IPagingArgs): Promise<IGetAllAndCountResult<User>>;
  getAll(args: any): Promise<User[]>;
  getById(args: IEntityID): Promise<User | undefined>;
  create(args: IUserCreateRepo): Promise<User>;
  update(args: IUserUpdate): Promise<User>;
  remove(args: IEntityRemove): Promise<User>;
  /**
   * Gets user by email and company with null values
   */
  getByEmailAndNoCompany(args: IEmailQuery): Promise<User | undefined>;
  /**
   * Gets user by email with the provided company
   */
  getByEmailAndCompanyCode(args: IEmailCompanyQuery): Promise<User | undefined>;
}

export interface IUserService {
  getAllAndCount(args: IPagingArgs): Promise<IPaginationData<User>>;
  create(args: IUserCreate): Promise<User>;
  update(args: IUserUpdate): Promise<User>;
  remove(args: IEntityRemove): Promise<User>;
  getById(args: IEntityID): Promise<User | undefined>;
  changeProfilePicture(args: IChangeProfilePictureInput): Promise<User>;
  searchClient(args: IPagingArgs): Promise<IPaginationData<User>>;
}
