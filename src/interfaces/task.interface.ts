import { TaskStatus } from '../config/constants';
import Task from '../entities/task.entity';
import User from '../entities/user.entity';
import { IEntityID, IEntityRemove } from './common.interface';
import { IGetAllAndCountResult, IPaginationData, IPagingArgs } from './paging.interface';

export interface ITask {
  id: string;
  name: string;
  status: TaskStatus;
  isArchived: boolean;
  users: [User];
}
export interface ITaskCreateInput {
  name: string;
  status: TaskStatus;
  isArchived: boolean;
  manager_id: string;
  company_id: string;
}

export interface ITaskUpdateInput {
  id: string;
  name?: string | undefined;
  status?: TaskStatus | undefined;
  isArchived?: boolean | undefined;
  manager_id?: string | undefined;
  company_id?: string | undefined;
}

export interface IAssignTask {
  employee_id: string[];
  task_id: string;
}
export interface ITaskService {
  getAllAndCount(filters?: any): Promise<IPaginationData<Task>>;
  create(args: ITaskCreateInput): Promise<Task>;
  update(args: ITaskUpdateInput): Promise<Task>;
  remove(args: IEntityRemove): Promise<Task>;
  assignTask(args: IAssignTask): Promise<Task>;
  getAssignedTaskById(args: IEntityID): Promise<Task>;
}

export interface ITaskRepository {
  getAllAndCount(args: IPagingArgs): Promise<IGetAllAndCountResult<Task>>;
  getAll(args: any): Promise<Task[]>;
  getById(args: IEntityID): Promise<Task | undefined>;
  create(args: ITaskCreateInput): Promise<Task>;
  update(args: ITaskUpdateInput): Promise<Task>;
  remove(args: IEntityRemove): Promise<Task>;
  assignTask(args: IAssignTask): Promise<Task>;
  getAssignedTaskById(args: IEntityID): Promise<Task>;
}
