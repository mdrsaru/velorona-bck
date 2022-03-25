import {
  IPagingArgs,
  IGetAllAndCountResult,
  IPaginationData,
} from './paging.interface';
import { IEntityRemove, IEntityID } from './common.interface';
import Client from '../entities/client.entity';
import { ClientStatus } from '../config/constants';

export interface IClient {
  id: string;
  name: string;
  status: ClientStatus;
  clientCode: string;
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
export interface IClientCodeInput {
  clientCode: string;
}
export interface IClientRepository {
  getAllAndCount(args: IPagingArgs): Promise<IGetAllAndCountResult<Client>>;
  getAll(args: any): Promise<Client[]>;
  getById(args: IEntityID): Promise<Client | undefined>;
  create(args: IClientCreate): Promise<Client>;
  update(args: IClientUpdate): Promise<Client>;
  remove(args: IEntityRemove): Promise<Client>;
  getByClientCode(args: IClientCodeInput): Promise<Client | undefined>;
}

export interface IClientService {
  getAllAndCount(args: IPagingArgs): Promise<IPaginationData<Client>>;
  create(args: IClientCreate): Promise<Client>;
  update(args: IClientUpdate): Promise<Client>;
  remove(args: IEntityRemove): Promise<Client>;
}
