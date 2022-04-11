import exp from 'constants';
import UserClient from '../entities/user-client.entity';

export interface IUserClientCreate {
  client_id: string;
  user_id: string;
}
export interface IUserClientRepository {
  getAll(args: any): Promise<UserClient[]>;
  create(args: IUserClientCreate): Promise<UserClient>;
}
