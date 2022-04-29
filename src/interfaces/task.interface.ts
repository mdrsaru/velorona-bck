import { TaskStatus } from '../config/constants';
import Task from '../entities/task.entity';
import User from '../entities/user.entity';
import { IEntityID, IEntityRemove } from './common.interface';
import { IGetAllAndCountResult, IPaginationData, IPagingArgs } from './paging.interface';

export interface ITask {
  id: string;
  name: string;
  status: TaskStatus;
  archived: boolean;
  users: [User];
}
export interface ITaskCreateInput {
  name: string;
  status: TaskStatus;
  archived?: boolean;
  manager_id: string;
  company_id: string;
  project_id: string;
  user_id?: string[];
}

export interface ITaskUpdateInput {
  id: string;
  name?: string | undefined;
  status?: TaskStatus | undefined;
  archived?: boolean | undefined;
  manager_id?: string | undefined;
  company_id?: string | undefined;
  project_id?: string | undefined;
  user_id?: string[];
}

export interface IAssignTask {
  user_id: string[];
  task_id: string;
}

export interface ITaskService {
  getAllAndCount(filters?: any): Promise<IPaginationData<Task>>;
  create(args: ITaskCreateInput): Promise<Task>;
  update(args: ITaskUpdateInput): Promise<Task>;
  remove(args: IEntityRemove): Promise<Task>;
  assignTask(args: IAssignTask): Promise<Task>;
  getAssignedUserById(args: IEntityID): Promise<User[]>;
}

export interface ITaskRepository {
  getAllAndCount(args: IPagingArgs): Promise<IGetAllAndCountResult<Task>>;
  getAll(args: any): Promise<Task[]>;
  getById(args: IEntityID): Promise<Task | undefined>;
  create(args: ITaskCreateInput): Promise<Task>;
  update(args: ITaskUpdateInput): Promise<Task>;
  remove(args: IEntityRemove): Promise<Task>;
  assignTask(args: IAssignTask): Promise<Task>;
}

export interface ITaskAssignmentUserQuery {
  user_id: string;
}

export interface ITaskAssignment {
  user_id: string;
  task_id: string;
}

export interface ITaskAssignmentRepository {
  getTaskAssignmentByUser(args: ITaskAssignmentUserQuery): Promise<ITaskAssignment[]>;
}
