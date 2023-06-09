import { IPagingArgs, IGetAllAndCountResult, IPaginationData, IGetOptions } from './paging.interface';
import { IEntityRemove, IEntityID } from './common.interface';
import UserPayRate from '../entities/user-payrate.entity';
import { UserPayRateStatus } from '../config/constants';

export interface IUserPayRate {
  id: string;
  startDate: Date;
  endDate: Date;
  amount: number;
  user_id: string;
  project_id: string;
  user_rate_currency_id?: string;
  invoice_rate_currency_id?: string;
  invoiceRate?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserPayRateCreateInput {
  startDate?: IUserPayRate['startDate'];
  endDate?: IUserPayRate['endDate'];
  amount: IUserPayRate['amount'];
  user_id: IUserPayRate['user_id'];
  project_id: IUserPayRate['project_id'];
  invoiceRate?: IUserPayRate['invoiceRate'];
  user_rate_currency_id?: IUserPayRate['user_rate_currency_id'];
  invoice_rate_currency_id?: IUserPayRate['invoice_rate_currency_id'];
}

export interface IUserPayRateUpdateInput {
  id: IUserPayRate['id'];
  startDate?: IUserPayRate['startDate'];
  endDate?: IUserPayRate['endDate'];
  amount?: IUserPayRate['amount'];
  user_id?: IUserPayRate['user_id'];
  project_id?: IUserPayRate['project_id'];
  invoiceRate?: IUserPayRate['invoiceRate'];
  user_rate_currency_id?: IUserPayRate['user_rate_currency_id'];
  invoice_rate_currency_id?: IUserPayRate['invoice_rate_currency_id'];
  status?: string;
}

export interface IPayrateByUserAndProject {
  user_id: string;
  project_id: string;
}

export interface IUserPayRateRepository {
  getAllAndCount(args: IPagingArgs): Promise<IGetAllAndCountResult<UserPayRate>>;
  getAll(args: IGetOptions): Promise<UserPayRate[]>;
  getById(args: IEntityID): Promise<UserPayRate | undefined>;
  create(args: IUserPayRateCreateInput): Promise<UserPayRate>;
  update(args: IUserPayRateUpdateInput): Promise<UserPayRate>;
  remove(args: IEntityRemove): Promise<UserPayRate>;
}

export interface IUserPayRateService {
  getAllAndCount(args: IPagingArgs): Promise<IPaginationData<UserPayRate>>;
  create(args: IUserPayRateCreateInput): Promise<UserPayRate>;
  update(args: IUserPayRateUpdateInput): Promise<UserPayRate>;
  remove(args: IEntityRemove): Promise<UserPayRate>;
}
