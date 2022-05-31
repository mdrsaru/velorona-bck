import { TaskStatus } from '../config/constants';
import Task from '../entities/task.entity';
import User from '../entities/user.entity';
import { IEntityID, IEntityRemove } from './common.interface';
import { IGetAllAndCountResult, IPaginationData, IPagingArgs } from './paging.interface';

export interface ITask {
  id: string;
  name: string;
  description: string;
  status: TaskStatus;
  archived: boolean;
  users: [User];
  active: boolean;
}
export interface ITaskCreateInput {
  name: ITask['name'];
  description: ITask['description'];
  status: ITask['status'];
  archived?: ITask['archived'];
  active?: ITask['active'];
  manager_id: string;
  company_id: string;
  project_id: string;
  user_ids?: string[];
  attachment_ids?: string[];
}

export interface ITaskUpdateInput {
  id: string;
  name?: ITask['name'];
  description?: ITask['description'];
  status?: ITask['status'];
  archived?: ITask['archived'];
  active?: ITask['active'];
  manager_id?: string | undefined;
  project_id?: string | undefined;
  user_ids?: string[];
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
