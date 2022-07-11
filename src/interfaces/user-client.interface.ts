import User from '../entities/user.entity';
import UserClient from '../entities/user-client.entity';
import { ISingleEntityQuery } from './common.interface';
import { IGetOptions } from './paging.interface';

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
  associate(args: IUserClientCreate): Promise<UserClient>;
  changeStatusToInactive(args: IUserClientMakeInactive): Promise<User>;
}

export interface IUserClientRepository {
  getAll(args: IGetOptions): Promise<UserClient[]>;
  getSingleEntity(args: ISingleEntityQuery): Promise<UserClient | undefined>;
  create(args: IUserClientCreate): Promise<UserClient>;
  changeStatusToInactive(args: IUserClientMakeInactive): Promise<User>;
}
