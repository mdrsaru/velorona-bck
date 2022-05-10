import Company from '../entities/company.entity';
import Project from '../entities/project.entity';
import User from '../entities/user.entity';
import { IGetAllAndCountResult, IPaginationData, IPagingArgs } from './paging.interface';

import TimeEntry from '../entities/time-entry.entity';
import { IEntityID, IEntityRemove } from './common.interface';
import Task from '../entities/task.entity';
import Client from '../entities/client.entity';
import Timesheet from '../entities/timesheet.entity';
import { TimesheetStatus } from '../config/constants';

export interface ITimesheet {
  id: string;
  weekStartDate: string;
  weekEndDate: string;
  totalHours: number;
  totalExpense: number;
  status: TimesheetStatus;
  user_id: string;
  client_id: string;
  approver_id: string;
  company_id: string;
  approver: User;
  company: Company;
  user: User;
  client: Client;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITimesheetCreateInput {
  weekStartDate: ITimesheet['weekStartDate'];
  weekEndDate: ITimesheet['weekEndDate'];
  totalHours: ITimesheet['totalHours'];
  totalExpense: ITimesheet['totalExpense'];
  status: ITimesheet['status'];
  user_id: ITimesheet['user_id'];
  client_id: ITimesheet['client_id'];
  company_id: ITimesheet['company_id'];
  approver_id: ITimesheet['approver_id'];
}

export interface ITimesheetUpdateInput {
  id: ITimesheet['id'];
  weekStartDate?: ITimesheet['weekStartDate'];
  weekEndDate?: ITimesheet['weekEndDate'];
  totalHours?: ITimesheet['totalHours'];
  totalExpense?: ITimesheet['totalExpense'];
  status?: ITimesheet['status'];
  user_id?: ITimesheet['user_id'];
  client_id?: ITimesheet['client_id'];
}

export interface ITimesheetRepository {
  getAllAndCount(args: IPagingArgs): Promise<IGetAllAndCountResult<Timesheet>>;
  getAll(args: any): Promise<Timesheet[]>;
  getById(args: IEntityID): Promise<Timesheet | undefined>;
  create(args: ITimesheetCreateInput): Promise<Timesheet>;
  remove(args: IEntityRemove): Promise<Timesheet>;
}

export interface ITimesheetService {
  // create(args: ITimesheetCreateInput): Promise<Timesheet>;
  getAllAndCount(args: IPagingArgs): Promise<IPaginationData<Timesheet>>;
}
