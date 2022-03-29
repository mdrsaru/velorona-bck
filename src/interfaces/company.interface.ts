import { IPagingArgs, IGetAllAndCountResult, IPaginationData } from './paging.interface';
import { IEntityRemove, IEntityID } from './common.interface';
import Company from '../entities/company.entity';
import { CompanyStatus } from '../config/constants';

export interface ICompany {
  id: string;
  name: string;
  status: CompanyStatus;
  isArchived: boolean;
  companyCode: string;
  createdAt: string;
  updatedAt: string;
}

export interface ICompanyCreate {
  name: ICompany['name'];
  status: ICompany['status'];
  isArchived?: ICompany['isArchived'];
}

export interface ICompanyUpdate {
  id: string;
  name: ICompany['name'];
  status: ICompany['status'];
  isArchived?: ICompany['isArchived'];
}
export interface ICompanyCodeInput {
  companyCode: string;
}
export interface ICompanyRepository {
  getAllAndCount(args: IPagingArgs): Promise<IGetAllAndCountResult<Company>>;
  getAll(args: any): Promise<Company[]>;
  getById(args: IEntityID): Promise<Company | undefined>;
  create(args: ICompanyCreate): Promise<Company>;
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
