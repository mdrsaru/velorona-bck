import Company from '../entities/company.entity';
import Project from '../entities/project.entity';
import User from '../entities/user.entity';
import { IGetAllAndCountResult, IPaginationData, IPagingArgs } from './paging.interface';

import TimeEntry from '../entities/time-entry.entity';
import { IEntityID, IEntityRemove } from './common.interface';
import Task from '../entities/task.entity';

export interface ITimeEntry {
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
  task?: Task;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITimeEntryCreateInput {
  start: ITimeEntry['start'];
  end: ITimeEntry['end'];
  clientLocation: ITimeEntry['clientLocation'];
  project_id: ITimeEntry['project_id'];
  company_id: ITimeEntry['company_id'];
  created_by: ITimeEntry['created_by'];
  task_id: ITimeEntry['task_id'];
}

export interface ITimeEntryUpdateInput {
  id: ITimeEntry['id'];
  start?: ITimeEntry['start'];
  end?: ITimeEntry['end'];
  clientLocation?: ITimeEntry['clientLocation'];
  approver_id?: ITimeEntry['approver_id'];
  project_id?: ITimeEntry['project_id'];
  company_id?: ITimeEntry['company_id'];
  created_by?: ITimeEntry['created_by'];
  task_id?: ITimeEntry['task_id'];
}

export interface ITimeEntryStopInput {
  id: ITimeEntry['id'];
  end: ITimeEntry['end'];
}

export interface ITimeEntryWeeklyDetailsInput {
  company_id: string;
  created_by: string;
  start?: Date;
  end?: Date;
}

export interface ITimeEntryTotalDurationInput {
  company_id: string;
  user_id: string;
  start: string;
  end: string;
  project_id: string;
}

export interface ITimeEntryWeeklyDetailsRepoInput {
  company_id: string;
  created_by: string;
  start: Date;
  end: Date;
}

export interface ITimeEntryRepository {
  getAllAndCount(args: IPagingArgs): Promise<IGetAllAndCountResult<TimeEntry>>;
  getAll(args: any): Promise<TimeEntry[]>;
  getById(args: IEntityID): Promise<TimeEntry | undefined>;
  /*
  Calculate total time in seconds of users time entry for the given interval
  */
  getTotalTimeInSeconds(args: ITimeEntryTotalDurationInput): Promise<number>;
  getWeeklyDetails(args: ITimeEntryWeeklyDetailsRepoInput): Promise<TimeEntry[]>;
  create(args: ITimeEntryCreateInput): Promise<TimeEntry>;
  update(args: ITimeEntryUpdateInput): Promise<TimeEntry>;
  remove(args: IEntityRemove): Promise<TimeEntry>;
}

export interface ITimeEntryService {
  getAllAndCount(args: IPagingArgs): Promise<IPaginationData<TimeEntry>>;
  getWeeklyDetails(args: ITimeEntryWeeklyDetailsInput): Promise<TimeEntry[]>;
  create(args: ITimeEntryCreateInput): Promise<TimeEntry>;
  update(args: ITimeEntryUpdateInput): Promise<TimeEntry>;
  stop(args: ITimeEntryStopInput): Promise<TimeEntry>;
  remove(args: IEntityRemove): Promise<TimeEntry>;
}
