import UserProject from '../entities/user-project.entity';
import User from '../entities/user.entity';
import { ISingleEntityQuery } from './common.interface';
import { IGetAllAndCountResult, IGetOptions, IPaginationData, IPagingArgs } from './paging.interface';

export interface IUserProjectCreate {
  project_id: string;
  user_id: string;
}

export interface IUserProjectMakeInactive {
  user_id: string;
}

export interface IUserProjectChangeStatus {
  user_id: string;
  project_id: string;
  status: string;
}
export interface IUserProjectService {
  getAllAndCount(args: IPagingArgs): Promise<IPaginationData<UserProject>>;
  changeStatus(args: IUserProjectChangeStatus): Promise<UserProject>;
}

export interface IUserProjectRepository {
  getAll(args: IGetOptions): Promise<UserProject[]>;
  getAllAndCount(args: IPagingArgs): Promise<IGetAllAndCountResult<UserProject>>;
  getSingleEntity(args: ISingleEntityQuery): Promise<UserProject | undefined>;
  update(args: IUserProjectChangeStatus): Promise<UserProject>;
  changeStatusToInactive(args: IUserProjectMakeInactive): Promise<User>;
}
