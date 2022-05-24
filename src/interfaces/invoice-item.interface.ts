import { IPagingArgs, IGetAllAndCountResult, IPaginationData, IGetOptions } from './paging.interface';
import { IEntityRemove, IEntityID } from './common.interface';
import InvoiceItem from '../entities/invoice-item.entity';

export interface IInvoiceItem {
  id: string;
  invoice_id: string;
  project_id: string;
  hours: number;
  rate: number;
  amount: number;
  createdAt: string;
  updatedAt: string;
}

export interface IInvoiceItemInput {
  project_id: IInvoiceItem['project_id'];
  hours: IInvoiceItem['hours'];
  rate: IInvoiceItem['rate'];
  amount: IInvoiceItem['amount'];
}

/**
 * Input for creating invoice projects by invoice
 */
export interface IInvoiceItemCreateInput {
  invoice_id: string;
  items: IInvoiceItemInput[];
}

export interface IInvoiceItemUpdateInput {
  id: IInvoiceItem['id'];
  project_id: IInvoiceItem['project_id'];
  hours: IInvoiceItem['hours'];
  rate: IInvoiceItem['rate'];
  amount: IInvoiceItem['amount'];
}

export interface IInvoiceItemRemoveMultipleInput {
  ids: string[];
}

export interface IInvoiceItemRepository {
  getAll(args: IGetOptions): Promise<InvoiceItem[]>;
  /**
   * Create multiple invoice itemss for the invoice_id
   */
  createMultiple(args: IInvoiceItemCreateInput): Promise<InvoiceItem[]>;
  updateMultiple(args: IInvoiceItemUpdateInput[]): Promise<InvoiceItem[]>;
  removeMultiple(args: IInvoiceItemRemoveMultipleInput): Promise<true>;
}
