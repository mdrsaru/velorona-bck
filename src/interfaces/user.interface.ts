import { IPagingArgs, IGetAllAndCountResult, IPaginationData, IGetOptions } from './paging.interface';
import { IEntityRemove, IEntityID, ISingleEntityQuery, ICountInput } from './common.interface';
import User from '../entities/user.entity';
import Role from '../entities/role.entity';
import { UserStatus, EntryType } from '../config/constants';
import { IAddress, IAddressCreateInput, IAddressUpdateInput } from './address.interface';

export interface IUser {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  phone: string;
  designation?: string;
  status: UserStatus;
  address?: IAddress;
  roles: Role[];
  company_id?: string;
  entryType?: EntryType;
  archived: boolean;
  startDate?: Date;
  endDate?: Date;
  timesheet_attachment?: boolean;
  loggedIn?: boolean;
  manager_id?: string;
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
  designation?: IUser['designation'];
  entryType?: IUser['entryType'];
  roles: string[];
  company_id?: string;
  startDate?: IUser['startDate'];
  endDate?: IUser['endDate'];
  timesheet_attachment?: IUser['timesheet_attachment'];
  address?: IAddressCreateInput;
  manager_id?: IUser['manager_id'];
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
  email?: IUser['email'];
  phone?: IUser['phone'];
  status?: IUser['status'];
  designation?: IUser['designation'];
  address?: IAddressUpdateInput;
  password?: string;
  avatar_id?: string;
  archived?: boolean;
  startDate?: IUser['startDate'];
  endDate?: IUser['endDate'];
  timesheet_attachment?: IUser['timesheet_attachment'];
  entryType?: IUser['entryType'];
  manager_id?: IUser['manager_id'];
  roles?: string[];
  loggedIn?: IUser['loggedIn'];
}

export interface IUserArchiveOrUnArchive {
  id: string;
  archived: boolean;
}

export interface IUserAttachProject {
  user_id: string[];
  project_ids: string[];
}

export interface IUserCountInput extends ICountInput {}

export interface IUserRepository {
  getAllAndCount(args: IPagingArgs): Promise<IGetAllAndCountResult<User>>;
  getAll(args: any): Promise<User[]>;
  getById(args: IEntityID): Promise<User | undefined>;
  getSingleEntity(args: ISingleEntityQuery): Promise<User | undefined>;
  countEntities(args: IGetOptions): Promise<number>;
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
  userArchiveOrUnArchive(args: IUserArchiveOrUnArchive): Promise<User>;
  remove(args: IEntityRemove): Promise<User>;
  getById(args: IEntityID): Promise<User | undefined>;
  attachProject(args: IUserAttachProject): Promise<User | undefined>;
  changeProfilePicture(args: IChangeProfilePictureInput): Promise<User>;
}
