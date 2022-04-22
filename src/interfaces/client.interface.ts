import { IPagingArgs, IGetAllAndCountResult, IPaginationData } from './paging.interface';
import { IEntityRemove, IEntityID, ISingleEntityQuery } from './common.interface';
import { IAddressInput } from './address.interface';
import Client from '../entities/client.entity';
import { ClientStatus } from '../config/constants';

export interface IClient {
  id: string;
  name: string;
  email: string;
  invoicingEmail: string;
  status: ClientStatus;
  archived: boolean;
  address_id: string;
  company_id: string;
  createdAt: string;
  updatedAt: string;
}

export interface IClientCreateInput {
  name: IClient['name'];
  status: IClient['status'];
  email: IClient['email'];
  invoicingEmail: IClient['invoicingEmail'];
  archived?: IClient['archived'];
  company_id: IClient['company_id'];
  address: IAddressInput;
}

export interface IClientUpdateInput {
  id: string;
  name: IClient['name'];
  status: IClient['status'];
  archived?: IClient['archived'];
  address: IAddressInput;
}

export interface IClientRepository {
  getAllAndCount(args: IPagingArgs): Promise<IGetAllAndCountResult<Client>>;
  getAll(args: any): Promise<Client[]>;
  getSingleEntity(args: ISingleEntityQuery): Promise<Client | undefined>;
  getById(args: IEntityID): Promise<Client | undefined>;
  create(args: IClientCreateInput): Promise<Client>;
  update(args: IClientUpdateInput): Promise<Client>;
  remove(args: IEntityRemove): Promise<Client>;
}

export interface IClientService {
  getAllAndCount(args: IPagingArgs): Promise<IPaginationData<Client>>;
  create(args: IClientCreateInput): Promise<Client>;
  update(args: IClientUpdateInput): Promise<Client>;
  remove(args: IEntityRemove): Promise<Client>;
}
