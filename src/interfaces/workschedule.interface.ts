import Company from '../entities/company.entity';
import Task from '../entities/task.entity';
import User from '../entities/user.entity';
import Workschedule from '../entities/workschedule.entity';
import { IEntityID, IEntityRemove } from './common.interface';
import { IGetAllAndCountResult, IPaginationData, IPagingArgs } from './paging.interface';

export interface IWorkschedule {
  id: string;
  startDate: Date;
  endDate: Date;
  payrollAllocatedHours: Number;
  payrollUsageHours: Number;
  status: string;
  company_id: string;
  company: Company[];
}
export interface IWorkscheduleCreateInput {
  startDate: IWorkschedule['startDate'];
  endDate: IWorkschedule['endDate'];
  payrollAllocatedHours?: IWorkschedule['payrollAllocatedHours'];
  payrollUsageHours: IWorkschedule['payrollUsageHours'];
  status: IWorkschedule['status'];
  company_id: IWorkschedule['company_id'];
}

export interface IWorkscheduleUpdateInput {
  id: string;
  startDate?: IWorkschedule['startDate'];
  endDate?: IWorkschedule['endDate'];
  payrollAllocatedHours?: IWorkschedule['payrollAllocatedHours'];
  payrollUsageHours?: IWorkschedule['payrollUsageHours'];
  status?: IWorkschedule['status'];
  company_id?: IWorkschedule['company_id'];
}

export interface IWorkscheduleService {
  getAllAndCount(filters?: any): Promise<IPaginationData<Workschedule>>;
  create(args: IWorkscheduleCreateInput): Promise<Workschedule>;
  update(args: IWorkscheduleUpdateInput): Promise<Workschedule>;
  remove(args: IEntityRemove): Promise<Workschedule>;
}

export interface IWorkscheduleRepository {
  getAllAndCount(args: IPagingArgs): Promise<IGetAllAndCountResult<Workschedule>>;
  getAll(args: any): Promise<Workschedule[]>;
  getById(args: IEntityID): Promise<Workschedule | undefined>;
  create(args: IWorkscheduleCreateInput): Promise<Workschedule>;
  update(args: IWorkscheduleUpdateInput): Promise<Workschedule>;
  remove(args: IEntityRemove): Promise<Workschedule>;
}
