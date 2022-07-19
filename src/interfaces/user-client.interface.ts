import User from '../entities/user.entity';
import UserClient from '../entities/user-client.entity';
import { ISingleEntityQuery } from './common.interface';
import { IGetAllAndCountResult, IGetOptions, IPaginationData, IPagingArgs } from './paging.interface';

export interface IUserClientCreate {
  client_id: string;
  user_id: string;
}

export interface IUserClientMakeInactive {
  user_id: string;
}

export interface IUserIdQuery {
  user_id: string;
  relations?: string[];
}
export interface IUserClientService {
  getAllAndCount(args: IPagingArgs): Promise<IPaginationData<UserClient>>;
  associate(args: IUserClientCreate): Promise<UserClient>;
  changeStatusToInactive(args: IUserClientMakeInactive): Promise<User>;
}

export interface IUserClientRepository {
  getAll(args: IGetOptions): Promise<UserClient[]>;
  getAllAndCount(args: IPagingArgs): Promise<IGetAllAndCountResult<UserClient>>;
  getSingleEntity(args: ISingleEntityQuery): Promise<UserClient | undefined>;
  create(args: IUserClientCreate): Promise<UserClient>;
  changeStatusToInactive(args: IUserClientMakeInactive): Promise<User>;
}
