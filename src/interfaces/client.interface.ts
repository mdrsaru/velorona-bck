import { IPagingArgs, IGetAllAndCountResult, IPaginationData, IGetOptions } from './paging.interface';
import { IEntityRemove, IEntityID, ISingleEntityQuery, ICountInput } from './common.interface';
import { IAddressInput } from './address.interface';
import Client from '../entities/client.entity';
import { ClientStatus, InvoiceSchedule } from '../config/constants';

export interface IClient {
  id: string;
  name: string;
  email: string;
  phone: string;
  invoicingEmail: string;
  status: ClientStatus;
  archived: boolean;
  address_id: string;
  company_id: string;
  invoiceSchedule: InvoiceSchedule;
  invoice_payment_config_id: string;
  scheduleStartDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface IClientCreateInput {
  name: IClient['name'];
  status: IClient['status'];
  email: IClient['email'];
  phone: IClient['phone'];
  invoicingEmail: IClient['invoicingEmail'];
  archived?: IClient['archived'];
  company_id: IClient['company_id'];
  address: IAddressInput;
  invoiceSchedule?: IClient['invoiceSchedule'];
  invoice_payment_config_id?: IClient['invoice_payment_config_id'];
  scheduleStartDate?: IClient['scheduleStartDate'];
}

export interface IClientUpdateInput {
  id: string;
  name: IClient['name'];
  status: IClient['status'];
  archived?: IClient['archived'];
  phone?: IClient['phone'];
  invoicingEmail?: IClient['invoicingEmail'];
  address: IAddressInput;
  invoiceSchedule?: IClient['invoiceSchedule'];
  invoice_payment_config_id?: IClient['invoice_payment_config_id'];
  scheduleStartDate?: IClient['scheduleStartDate'];
}

export interface IClientCountInput extends ICountInput {}

export interface IClientRepository {
  getAllAndCount(args: IPagingArgs): Promise<IGetAllAndCountResult<Client>>;
  getAll(args: any): Promise<Client[]>;
  getSingleEntity(args: ISingleEntityQuery): Promise<Client | undefined>;
  countEntities(args: IGetOptions): Promise<number>;
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
