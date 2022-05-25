import Company from '../entities/company.entity';
import Project from '../entities/project.entity';
import User from '../entities/user.entity';
import { IGetAllAndCountResult, IPaginationData, IPagingArgs } from './paging.interface';

import TimeEntry from '../entities/time-entry.entity';
import { IEntityID, IEntityRemove } from './common.interface';
import Task from '../entities/task.entity';

export interface ITimeEntry {
  id: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
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
  task?: Task;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITimeEntryCreateInput {
  startTime: ITimeEntry['startTime'];
  endTime?: ITimeEntry['endTime'];
  clientLocation: ITimeEntry['clientLocation'];
  project_id: ITimeEntry['project_id'];
  company_id: ITimeEntry['company_id'];
  created_by: ITimeEntry['created_by'];
  task_id: ITimeEntry['task_id'];
}

export interface ITimeEntryUpdateInput {
  id: ITimeEntry['id'];
  startTime?: ITimeEntry['startTime'];
  endTime?: ITimeEntry['endTime'];
  clientLocation?: ITimeEntry['clientLocation'];
  approver_id?: ITimeEntry['approver_id'];
  project_id?: ITimeEntry['project_id'];
  company_id?: ITimeEntry['company_id'];
  created_by?: ITimeEntry['created_by'];
  task_id?: ITimeEntry['task_id'];
}

export interface ITimeEntryStopInput {
  id: ITimeEntry['id'];
  endTime: ITimeEntry['endTime'];
}

export interface ITimeEntryWeeklyDetailsInput {
  company_id: string;
  created_by: string;
  startTime?: Date;
  endTime?: Date;
}

export interface ITimeEntryTotalDurationInput {
  company_id: string;
  user_id: string;
  startTime: string;
  endTime: string;
  project_id?: string;
}

export interface IUserTotalExpenseInput {
  company_id: string;
  user_id: string;
  client_id: string;
  startTime: string;
  endTime: string;
}

export interface ITimeEntryWeeklyDetailsRepoInput {
  company_id: string;
  created_by: string;
  startTime: Date;
  endTime: Date;
}

export interface ITimeEntryActiveInput {
  created_by: string;
  company_id: string;
}

export interface ITimeEntryBulkRemove {
  ids: string[];
  created_by?: string;
}

export interface IProjectItem {
  project_id: string;
  projectName: string;
  totalDuration: number;
  hourlyRate: number;
  totalExpense: number;
}

export interface IProjectItemInput {
  startTime: string;
  endTime: string;
  company_id: string;
  user_id: string;
  client_id: string;
}

export interface ITimeEntryRepository {
  getAllAndCount(args: IPagingArgs): Promise<IGetAllAndCountResult<TimeEntry>>;

  getAll(args: any): Promise<TimeEntry[]>;

  getById(args: IEntityID): Promise<TimeEntry | undefined>;

  /**
   * Get active time entry. i.e entry of user for which end_time is null
   */
  getActiveEntry(args: ITimeEntryActiveInput): Promise<TimeEntry | undefined>;

  /*
  Calculate total time in seconds of users time entry for the given interval
  */
  getTotalTimeInSeconds(args: ITimeEntryTotalDurationInput): Promise<number>;

  /**
   * Get user's total expense for the time entries related to all project for the given time interval
   */
  getUserTotalExpense(args: IUserTotalExpenseInput): Promise<number>;

  getWeeklyDetails(args: ITimeEntryWeeklyDetailsRepoInput): Promise<TimeEntry[]>;

  create(args: ITimeEntryCreateInput): Promise<TimeEntry>;

  update(args: ITimeEntryUpdateInput): Promise<TimeEntry>;

  remove(args: IEntityRemove): Promise<TimeEntry>;

  /*
  Removes multiple time entries(by created_by if the user is provided)`
  */
  bulkRemove(args: ITimeEntryBulkRemove): Promise<TimeEntry[]>;

  /**
   * Get projects with total expense, total hours and hourly rate of the time entries for the given time interval.
   */
  getProjectItems(args: IProjectItemInput): Promise<IProjectItem[]>;
}

export interface ITimeEntryService {
  getAllAndCount(args: IPagingArgs): Promise<IPaginationData<TimeEntry>>;
  getWeeklyDetails(args: ITimeEntryWeeklyDetailsInput): Promise<TimeEntry[]>;
  create(args: ITimeEntryCreateInput): Promise<TimeEntry>;
  update(args: ITimeEntryUpdateInput): Promise<TimeEntry>;
  stop(args: ITimeEntryStopInput): Promise<TimeEntry>;
  remove(args: IEntityRemove): Promise<TimeEntry>;
  bulkRemove(args: ITimeEntryBulkRemove): Promise<TimeEntry[]>;
}
