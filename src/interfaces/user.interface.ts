import { IPagingArgs, IGetAllAndCountResult, IPaginationData } from './paging.interface';
import { IEntityRemove, IEntityID } from './common.interface';
import User from '../entities/user.entity';
import Role from '../entities/role.entity';
import { UserStatus } from '../config/constants';
import { IAddress, IAddressCreateInput, IAddressUpdateInput } from './address.interface';

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
  createdAt: string;
  updatedAt: string;
}

export interface IEmailInput {
  email: string;
  relations?: string[];
}

export interface IUserCreate {
  email: IUser['email'];
  password: IUser['password'];
  firstName: IUser['firstName'];
  lastName: IUser['lastName'];
  middleName?: IUser['middleName'];
  phone: IUser['phone'];
  status: IUser['status'];
  roles: string[];
  client_id?: string;
  address?: IAddressCreateInput;
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
}

export interface IUserRepository {
  getAllAndCount(args: IPagingArgs): Promise<IGetAllAndCountResult<User>>;
  getAll(args: any): Promise<User[]>;
  getById(args: IEntityID): Promise<User | undefined>;
  create(args: IUserCreate): Promise<User>;
  update(args: IUserUpdate): Promise<User>;
  remove(args: IEntityRemove): Promise<User>;
  getByEmail(args: IEmailInput): Promise<User | undefined>;
}

export interface IUserService {
  getAllAndCount(args: IPagingArgs): Promise<IPaginationData<User>>;
  create(args: IUserCreate): Promise<User>;
  update(args: IUserUpdate): Promise<User>;
  remove(args: IEntityRemove): Promise<User>;
  getById(args: IEntityID): Promise<User | undefined>;
}
