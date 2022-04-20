import Company from '../entities/company.entity';
import Project from '../entities/project.entity';
import User from '../entities/user.entity';
import { IGetAllAndCountResult, IPaginationData, IPagingArgs } from './paging.interface';

import Timesheet from '../entities/timesheet.entity';
import { IEntityID, IEntityRemove } from './common.interface';

export interface ITimesheet {
  id: string;
  total_hours: number;
  total_expense: number;
  client_location: string;
  approver_id: string;
  project_id: string;
  company_id: string;
  created_by: string;
  approver: User;
  project: Project;
  company: Company;
  creator: User;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITimesheetCreateInput {
  total_hours: ITimesheet['total_hours'];
  total_expense: ITimesheet['total_expense'];
  client_location: ITimesheet['client_location'];
  approver_id: ITimesheet['approver_id'];
  project_id: ITimesheet['project_id'];
  company_id: ITimesheet['company_id'];
  created_by: ITimesheet['created_by'];
}

export interface ITimesheetUpdateInput {
  id: ITimesheet['id'];
  total_hours?: ITimesheet['total_hours'];
  total_expense?: ITimesheet['total_expense'];
  client_location?: ITimesheet['client_location'];
  approver_id?: ITimesheet['approver_id'];
  project_id?: ITimesheet['project_id'];
  company_id?: ITimesheet['company_id'];
  created_by?: ITimesheet['created_by'];
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
  remove(args: IEntityRemove): Promise<Timesheet>;
}
