import { TaskStatus } from '../config/constants';
import Task from '../entities/task.entity';
import { IEntityID, IEntityRemove } from './common.interface';
import {
  IGetAllAndCountResult,
  IPaginationData,
  IPagingArgs,
} from './paging.interface';

export interface ITask {
  id: string;
  name: string;
  status: TaskStatus;
  is_archived: boolean;
}

export interface ITaskCreateInput {
  name: string;
  status: TaskStatus;
  is_archived: boolean;
  manager_id: string;
  client_id: string;
}

export interface ITaskUpdateInput {
  id: string;
  name?: string | undefined;
  status?: TaskStatus | undefined;
  is_archived?: boolean | undefined;
  manager_id?: string | undefined;
  client_id?: string | undefined;
}
export interface ITaskService {
  getAllAndCount(filters?: any): Promise<IPaginationData<Task>>;
  create(args: ITaskCreateInput): Promise<Task>;
  update(args: ITaskUpdateInput): Promise<Task>;
  remove(args: IEntityRemove): Promise<Task>;
}

export interface ITaskRepository {
  getAllAndCount(args: IPagingArgs): Promise<IGetAllAndCountResult<Task>>;
  getAll(args: any): Promise<Task[]>;
  getById(args: IEntityID): Promise<Task | undefined>;
  create(args: ITaskCreateInput): Promise<Task>;
  update(args: ITaskUpdateInput): Promise<Task>;
  remove(args: IEntityRemove): Promise<Task>;
}
