import UserClient from '../entities/user-client.entity';

export interface IUserClientCreate {
  client_id: string;
  user_id: string;
}

export interface IUserIdQuery {
  user_id: string;
  relations?: string[];
}
export interface IUserClientService {
  associate(args: IUserClientCreate): Promise<UserClient>;
}
export interface IUserClientRepository {
  getAll(args: any): Promise<UserClient[]>;
  getByUserId(args: IUserIdQuery): Promise<UserClient | undefined>;
  create(args: IUserClientCreate): Promise<UserClient>;
}
