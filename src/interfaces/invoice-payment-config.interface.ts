import { IPagingArgs, IGetAllAndCountResult, IPaginationData, IGetOptions } from './paging.interface';
import { IEntityRemove, IEntityID, ISingleEntityQuery, ICountInput } from './common.interface';
import InvoicePaymentConfig from '../entities/invoice-payment-config.entity';

export interface IInvoicePaymentConfig {
  id: string;
  name: string;
  days: number;
  createdAt: string;
  updatedAt: string;
}

export interface IInvoicePaymentConfigCreateInput {
  name: IInvoicePaymentConfig['name'];
  days: IInvoicePaymentConfig['days'];
}

export interface IInvoicePaymentConfigUpdateInput {
  id: string;
  name: IInvoicePaymentConfig['name'];
  days: IInvoicePaymentConfig['days'];
}

export interface IInvoicePaymentConfigRepository {
  getAllAndCount(args: IPagingArgs): Promise<IGetAllAndCountResult<InvoicePaymentConfig>>;
  getAll(args: any): Promise<InvoicePaymentConfig[]>;
  getSingleEntity(args: ISingleEntityQuery): Promise<InvoicePaymentConfig | undefined>;
  getById(args: IEntityID): Promise<InvoicePaymentConfig | undefined>;
  create(args: IInvoicePaymentConfigCreateInput): Promise<InvoicePaymentConfig>;
  update(args: IInvoicePaymentConfigUpdateInput): Promise<InvoicePaymentConfig>;
  remove(args: IEntityRemove): Promise<InvoicePaymentConfig>;
}

export interface IInvoicePaymentConfigService {
  getAllAndCount(args: IPagingArgs): Promise<IPaginationData<InvoicePaymentConfig>>;
}
