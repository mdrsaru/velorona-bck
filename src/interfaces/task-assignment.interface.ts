import Role from '../entities/role.entity';
import { IEntityID, IEntityRemove } from './common.interface';
import { IGetAllAndCountResult, IPaginationData, IPagingArgs } from './paging.interface';
import { Role as RoleEnum } from '../config/constants';
import TaskAssignment from '../entities/task-assignment.entity';

export interface ITaskAssignment {
  id: string;
  employee_id: string;
  task_id: string;
}

export interface ITaskAssignmentCreate {
  employee_id: ITaskAssignment['employee_id'];
  task_id: ITaskAssignment['task_id'];
}
export interface ITaskAssignmentUpdate {
  id: string;
  employee_id?: ITaskAssignment['employee_id'];
  task_id: ITaskAssignment['task_id'];
}

export interface ITaskQuery {
  task_id: string;
}
export interface ITaskAssignmentRepository {
  create(args: ITaskAssignmentCreate): Promise<TaskAssignment>;
  getByTaskId(args: ITaskQuery): Promise<TaskAssignment>;
}

export interface ITaskAssignmentService {
  assignTask(args: ITaskAssignmentCreate): Promise<TaskAssignment>;
}
