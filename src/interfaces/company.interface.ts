import { IPagingArgs, IGetAllAndCountResult, IPaginationData } from './paging.interface';
import { IEntityRemove, IEntityID } from './common.interface';
import Company from '../entities/company.entity';
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
  user: ICompanyAdminCreateInput;
  logo_id?: ICompany['logo_id'];
}

export interface ICompanyUpdate {
  id: string;
  name: ICompany['name'];
  status: ICompany['status'];
  archived?: ICompany['archived'];
  logo_id?: ICompany['logo_id'];
}
export interface ICompanyCodeInput {
  companyCode: string;
}
export interface ICompanyRepository {
  getAllAndCount(args: IPagingArgs): Promise<IGetAllAndCountResult<Company>>;
  getAll(args: any): Promise<Company[]>;
  getById(args: IEntityID): Promise<Company | undefined>;
  create(args: ICompanyCreate): Promise<{ company: Company; user: User }>;
  update(args: ICompanyUpdate): Promise<Company>;
  remove(args: IEntityRemove): Promise<Company>;
  getByCompanyCode(args: ICompanyCodeInput): Promise<Company | undefined>;
}

export interface ICompanyService {
  getAllAndCount(args: IPagingArgs): Promise<IPaginationData<Company>>;
  create(args: ICompanyCreate): Promise<Company>;
  update(args: ICompanyUpdate): Promise<Company>;
  remove(args: IEntityRemove): Promise<Company>;
}
