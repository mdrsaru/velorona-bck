import { injectable, inject } from 'inversify';

import {
  IInvoiceCreateInput,
  IInvoiceUpdateInput,
  IInvoiceRepository,
  IInvoiceService,
} from '../interfaces/invoice.interface';
import Invoice from '../entities/invoice.entity';
import Paging from '../utils/paging';
import { TYPES } from '../types';
import { IPagingArgs, IPaginationData } from '../interfaces/paging.interface';
import { IEntityRemove, IEntityID } from '../interfaces/common.interface';

@injectable()
export default class InvoiceService implements IInvoiceService {
  private invoiceRepository: IInvoiceRepository;

  constructor(@inject(TYPES.InvoiceRepository) invoiceRepository: IInvoiceRepository) {
    this.invoiceRepository = invoiceRepository;
  }

  getAllAndCount = async (args: IPagingArgs): Promise<IPaginationData<Invoice>> => {
    try {
      const { rows, count } = await this.invoiceRepository.getAllAndCount(args);

      const paging = Paging.getPagingResult({
        ...args,
        total: count,
      });

      return {
        paging,
        data: rows,
      };
    } catch (err) {
      throw err;
    }
  };

  create = async (args: IInvoiceCreateInput): Promise<Invoice> => {
    try {
      const status = args.status;
      const issueDate = args.issueDate;
      const dueDate = args.dueDate;
      const poNumber = args.poNumber;
      const totalQuantity = args.totalQuantity;
      const subtotal = args.subtotal;
      const totalAmount = args.totalAmount;
      const taxPercent = args.taxPercent ?? 0;
      const notes = args.notes;
      const company_id = args.company_id;
      const client_id = args.client_id;
      const items = args.items;

      const invoice = await this.invoiceRepository.create({
        status,
        issueDate,
        dueDate,
        poNumber,
        totalQuantity,
        subtotal,
        totalAmount,
        taxPercent,
        notes,
        company_id,
        client_id,
        items,
      });

      return invoice;
    } catch (err) {
      throw err;
    }
  };

  update = async (args: IInvoiceUpdateInput): Promise<Invoice> => {
    try {
      const id = args.id;
      const status = args.status;
      const issueDate = args.issueDate;
      const dueDate = args.dueDate;
      const poNumber = args.poNumber;
      const totalQuantity = args.totalQuantity;
      const subtotal = args.subtotal;
      const totalAmount = args.totalAmount;
      const taxPercent = args.taxPercent ?? 0;
      const notes = args.notes;
      const items = args.items;

      const invoice = await this.invoiceRepository.update({
        id,
        status,
        issueDate,
        dueDate,
        poNumber,
        totalQuantity,
        subtotal,
        totalAmount,
        taxPercent,
        notes,
        items,
      });

      return invoice;
    } catch (err) {
      throw err;
    }
  };

  remove = async (args: IEntityRemove): Promise<Invoice> => {
    try {
      const id = args.id;

      const invoice = await this.invoiceRepository.remove({
        id,
      });

      return invoice;
    } catch (err) {
      throw err;
    }
  };
}
