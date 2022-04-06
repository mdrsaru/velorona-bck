import Company from '../entities/company.entity';
import Task from '../entities/task.entity';
import User from '../entities/user.entity';
import Workschedule from '../entities/workschedule.entity';
import { IEntityID, IEntityRemove } from './common.interface';
import { IGetAllAndCountResult, IPaginationData, IPagingArgs } from './paging.interface';

export interface IWorkschedule {
  id: string;
  date: Date;
  from: number;
  to: number;
  tasks: Task[];
  employee: User[];
  company: Company[];
}
export interface IWorkscheduleCreateInput {
  date: Date;
  from: number;
  to: number;
  task_id: string;
  employee_id: string;
  company_id: string;
}

export interface IWorkscheduleUpdateInput {
  id: string;
  date?: Date;
  from?: number;
  to?: number;
  task_id?: string;
  employee_id?: string;
  company_id?: string;
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
