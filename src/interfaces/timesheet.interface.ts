import Company from '../entities/company.entity';
import Project from '../entities/project.entity';
import User from '../entities/user.entity';
import TimeEntry from '../entities/time-entry.entity';
import Task from '../entities/task.entity';
import Client from '../entities/client.entity';
import Timesheet from '../entities/timesheet.entity';
import { TimesheetStatus } from '../config/constants';

import { IEntityID, IEntityRemove } from './common.interface';
import { IGetAllAndCountResult, IPaginationData, IPagingArgs, IGetOptions } from './paging.interface';

export interface ITimesheet {
  id: string;
  weekStartDate: string;
  weekEndDate: string;
  duration: number;
  totalExpense: number;
  status: TimesheetStatus;
  user_id: string;
  client_id: string;
  approver_id?: string;
  company_id: string;
  approver: User;
  company: Company;
  user: User;
  client: Client;
  lastApprovedAt: Date;
  isSubmitted: boolean;
  lastSubmittedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITimesheetCreateInput {
  weekStartDate: ITimesheet['weekStartDate'];
  weekEndDate: ITimesheet['weekEndDate'];
  duration: ITimesheet['duration'];
  totalExpense: ITimesheet['totalExpense'];
  status?: ITimesheet['status'];
  user_id: ITimesheet['user_id'];
  client_id: ITimesheet['client_id'];
  company_id: ITimesheet['company_id'];
  approver_id?: ITimesheet['approver_id'];
  lastApprovedAt?: ITimesheet['lastApprovedAt'];
  isSubmitted?: ITimesheet['isSubmitted'];
  lastSubmittedAt?: ITimesheet['lastSubmittedAt'];
}

export interface ITimesheetUpdateInput {
  id: ITimesheet['id'];
  duration?: ITimesheet['duration'];
  totalExpense?: ITimesheet['totalExpense'];
  status?: ITimesheet['status'];
  approver_id?: ITimesheet['approver_id'];
  lastApprovedAt?: ITimesheet['lastApprovedAt'];
  isSubmitted?: ITimesheet['isSubmitted'];
  lastSubmittedAt?: ITimesheet['lastSubmittedAt'];
}

export interface ITimesheetRepository {
  getAllAndCount(args: IPagingArgs): Promise<IGetAllAndCountResult<Timesheet>>;
  getAll(args: IGetOptions): Promise<Timesheet[]>;
  getById(args: IEntityID): Promise<Timesheet | undefined>;
  create(args: ITimesheetCreateInput): Promise<Timesheet>;
  update(args: ITimesheetUpdateInput): Promise<Timesheet>;
  remove(args: IEntityRemove): Promise<Timesheet>;
}

export interface ITimesheetService {
  getAllAndCount(args: IPagingArgs): Promise<IPaginationData<Timesheet>>;
  update(args: ITimesheetUpdateInput): Promise<Timesheet>;
}
