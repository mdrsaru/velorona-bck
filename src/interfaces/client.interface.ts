import { IPagingArgs, IGetAllAndCountResult, IPaginationData } from './paging.interface';
import { IEntityRemove } from './common.interface';

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
  name: IClient['name'];
  status: IClient['status'];
}

export interface IClientRepository {
  getAllAndCount(args: IPagingArgs): Promise<IGetAllAndCountResult<IClient[]>>;
  create(args: IClientCreate): Promise<IClient>;
  update(args: IClientUpdate): Promise<IClient>;
  remove(args: IEntityRemove): Promise<IClient>;
}

export interface IClientService {
  getAllAndCount(filters?: any): Promise<IPaginationData<IClient[]>>;
  create(args: IClientCreate): Promise<IClient>;
  update(args: IClientUpdate): Promise<IClient>;
  remove(args: IEntityRemove): Promise<IClient>;
}
