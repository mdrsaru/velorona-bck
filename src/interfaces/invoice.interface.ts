import { InvoiceStatus } from '../config/constants';

import { IPagingArgs, IGetAllAndCountResult, IPaginationData } from './paging.interface';
import { IInvoiceItemInput, IInvoiceItemUpdateInput } from './invoice-item.interface';
import { IEntityRemove, IEntityID } from './common.interface';
import Invoice from '../entities/invoice.entity';

export interface IInvoice {
  id: string;
  timesheet_id?: string;
  status: InvoiceStatus;
  verified: boolean;
  issueDate: Date;
  dueDate: Date;
  poNumber: string;
  totalQuantity: number;
  totalAmount: number;
  subtotal: number;
  taxPercent: number;
  notes?: string;
  company_id: string;
  client_id: string;
  createdAt: string;
  updatedAt: string;
}

export interface IInvoiceCreateInput {
  status: Invoice['status'];
  timesheet_id?: Invoice['timesheet_id'];
  issueDate: Invoice['issueDate'];
  dueDate: Invoice['dueDate'];
  poNumber: Invoice['poNumber'];
  totalQuantity: Invoice['totalQuantity'];
  subtotal: Invoice['subtotal'];
  totalAmount: Invoice['totalAmount'];
  taxPercent: Invoice['taxPercent'];
  notes?: Invoice['notes'];
  company_id: Invoice['company_id'];
  client_id: Invoice['client_id'];
  items: IInvoiceItemInput[];
}

export interface IInvoiceUpdateInput {
  id: Invoice['id'];
  status?: Invoice['status'];
  issueDate?: Invoice['issueDate'];
  dueDate?: Invoice['dueDate'];
  poNumber?: Invoice['poNumber'];
  totalQuantity?: Invoice['totalQuantity'];
  subtotal?: Invoice['subtotal'];
  totalAmount?: Invoice['totalAmount'];
  taxPercent?: Invoice['taxPercent'];
  notes?: Invoice['notes'];
  items?: IInvoiceItemUpdateInput[];
}

export interface IInvoiceRepository {
  getAllAndCount(args: IPagingArgs): Promise<IGetAllAndCountResult<Invoice>>;
  getAll(args: any): Promise<Invoice[]>;
  getById(args: IEntityID): Promise<Invoice | undefined>;
  create(args: IInvoiceCreateInput): Promise<Invoice>;
  update(args: IInvoiceUpdateInput): Promise<Invoice>;
  remove(args: IEntityRemove): Promise<Invoice>;
}

export interface IInvoiceService {
  getAllAndCount(args: IPagingArgs): Promise<IPaginationData<Invoice>>;
  create(args: IInvoiceCreateInput): Promise<Invoice>;
  update(args: IInvoiceUpdateInput): Promise<Invoice>;
  remove(args: IEntityRemove): Promise<Invoice>;
}
