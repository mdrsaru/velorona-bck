import { IPagingArgs, IGetAllAndCountResult, IPaginationData } from './paging.interface';
import { IEntityRemove, IEntityID } from './common.interface';
import Client from '../entities/client.entity';

export interface IClient {
  id: string;
  name: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface IClientCreate {
  name: IClient['name'];
  status: IClient['status'];
}

export interface IClientUpdate {
  id: string;
  name: IClient['name'];
  status: IClient['status'];
}

export interface IClientRepository {
  getAllAndCount(args: IPagingArgs): Promise<IGetAllAndCountResult<Client>>;
  getAll(args: any): Promise<Client[]>;
  getById(args: IEntityID): Promise<Client | undefined>;
  create(args: IClientCreate): Promise<Client>;
  update(args: IClientUpdate): Promise<Client>;
  remove(args: IEntityRemove): Promise<Client>;
}

export interface IClientService {
  getAllAndCount(args: IPagingArgs): Promise<IPaginationData<Client>>;
  create(args: IClientCreate): Promise<Client>;
  update(args: IClientUpdate): Promise<Client>;
  remove(args: IEntityRemove): Promise<Client>;
}
