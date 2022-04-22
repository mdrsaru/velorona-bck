import Company from '../entities/company.entity';
import Project from '../entities/project.entity';
import User from '../entities/user.entity';
import { IGetAllAndCountResult, IPaginationData, IPagingArgs } from './paging.interface';

import Timesheet from '../entities/timesheet.entity';
import { IEntityID, IEntityRemove } from './common.interface';
import Task from '../entities/task.entity';

export interface ITimesheet {
  id: string;
  start: Date;
  end: Date;
  clientLocation: string;
  approver_id: string;
  project_id: string;
  company_id: string;
  task_id: string;
  created_by: string;
  approver: User;
  project: Project;
  company: Company;
  creator: User;
  task: Task;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITimesheetCreateInput {
  start: ITimesheet['start'];
  end: ITimesheet['end'];
  clientLocation: ITimesheet['clientLocation'];
  project_id: ITimesheet['project_id'];
  company_id: ITimesheet['company_id'];
  created_by: ITimesheet['created_by'];
  task_id: ITimesheet['task_id'];
}

export interface ITimesheetUpdateInput {
  id: ITimesheet['id'];
  start?: ITimesheet['start'];
  end?: ITimesheet['end'];
  clientLocation?: ITimesheet['clientLocation'];
  approver_id?: ITimesheet['approver_id'];
  project_id?: ITimesheet['project_id'];
  company_id?: ITimesheet['company_id'];
  created_by?: ITimesheet['created_by'];
  task_id?: ITimesheet['task_id'];
}

export interface ITimeSheetStopInput {
  id: ITimesheet['id'];
  end: ITimesheet['end'];
}

export interface ITimesheetRepository {
  getAllAndCount(args: IPagingArgs): Promise<IGetAllAndCountResult<Timesheet>>;
  getAll(args: any): Promise<Timesheet[]>;
  getById(args: IEntityID): Promise<Timesheet | undefined>;
  create(args: ITimesheetCreateInput): Promise<Timesheet>;
  update(args: ITimesheetUpdateInput): Promise<Timesheet>;
  remove(args: IEntityRemove): Promise<Timesheet>;
}

export interface ITimesheetService {
  getAllAndCount(args: IPagingArgs): Promise<IPaginationData<Timesheet>>;
  create(args: ITimesheetCreateInput): Promise<Timesheet>;
  update(args: ITimesheetUpdateInput): Promise<Timesheet>;
  stop(args: ITimeSheetStopInput): Promise<Timesheet>;
  remove(args: IEntityRemove): Promise<Timesheet>;
}
