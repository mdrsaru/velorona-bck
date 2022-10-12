import { IPagingArgs, IGetAllAndCountResult, IPaginationData, IGetOptions } from './paging.interface';
import { IEntityRemove, IEntityID, ISingleEntityQuery } from './common.interface';
import { IUserUpdate } from './user.interface';
import Company, { CompanyGrowthOutput } from '../entities/company.entity';
import User from '../entities/user.entity';
import { CompanyStatus } from '../config/constants';
import Media from '../entities/media.entity';

export interface ICompany {
  id: string;
  name: string;
  status: CompanyStatus;
  archived: boolean;
  companyCode: string;
  admin_email: string;
  logo?: Media;
  logo_id?: string;
  plan?: string;
  stripeCustomerId?: string;
  subscriptionId?: string;
  subscriptionItemId?: string;
  subscriptionStatus?: string;
  trialEnded?: boolean;
  subscriptionPeriodEnd?: Date;
  createdAt: string;
  updatedAt: string;
}

export interface ICompanyAdminAddressInput {
  streetAddress?: string;
  aptOrSuite?: string;
  city?: string;
  state?: string;
  zipcode?: string;
}

export interface ICompanyAdminAddressUpdateInput extends ICompanyAdminAddressInput {
  id: string;
}

export interface ICompanyAdminCreateInput {
  email: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  middleName?: string;
  phone?: string;
  status?: string;
  address?: ICompanyAdminAddressInput;
}

export interface ICompanyCreate {
  name: ICompany['name'];
  status: ICompany['status'];
  archived?: ICompany['archived'];
  plan?: ICompany['plan'];
  user: ICompanyAdminCreateInput;
  logo_id?: ICompany['logo_id'];
}

export interface ICompanyUpdate {
  id: string;
  name?: ICompany['name'];
  status?: ICompany['status'];
  archived?: ICompany['archived'];
  logo_id?: ICompany['logo_id'];
  plan?: ICompany['plan'];
  trialEnded?: ICompany['trialEnded'];
  stripeCustomerId?: ICompany['stripeCustomerId'];
  subscriptionId?: ICompany['subscriptionId'];
  subscriptionItemId?: ICompany['subscriptionItemId'];
  subscriptionStatus?: ICompany['subscriptionStatus'];
  user?: IUserUpdate;
  subscriptionPeriodEnd?: ICompany['subscriptionPeriodEnd'];
}

export interface ICompanyCodeInput {
  companyCode: string;
}

export interface ICompanyRepository {
  getAllAndCount(args: IPagingArgs): Promise<IGetAllAndCountResult<Company>>;
  getAll(args: any): Promise<Company[]>;
  getById(args: IEntityID): Promise<Company | undefined>;
  countEntities(args: IGetOptions): Promise<number>;
  create(args: ICompanyCreate): Promise<{ company: Company; user: User }>;
  update(args: ICompanyUpdate): Promise<Company>;
  remove(args: IEntityRemove): Promise<Company>;
  getByCompanyCode(args: ICompanyCodeInput): Promise<Company | undefined>;
  companyGrowth(args?: any): Promise<CompanyGrowthOutput[]>;
  getSingleEntity(args: ISingleEntityQuery): Promise<Company | undefined>;
}

export interface ICompanyService {
  getAllAndCount(args: IPagingArgs): Promise<IPaginationData<Company>>;
  create(args: ICompanyCreate): Promise<Company>;
  update(args: ICompanyUpdate): Promise<Company>;
  remove(args: IEntityRemove): Promise<Company>;
}
