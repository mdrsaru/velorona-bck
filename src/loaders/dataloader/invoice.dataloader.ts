import Dataloader from 'dataloader';

import { TYPES } from '../../types';
import container from '../../inversify.config';
import { IInvoiceRepository } from '../../interfaces/invoice.interface';
import Invoice from '../../entities/invoice.entity';

const batchInvoicesByIdFn = async (ids: readonly string[]) => {
  const invoiceRepo: IInvoiceRepository = container.get(TYPES.InvoiceRepository);
  const query = { id: ids };
  const invoices = await invoiceRepo.getAll({ query });

  type InvoiceObj = {
    [id: string]: Invoice;
  };

  const invoiceObj: { [id: string]: Invoice } = {};
  invoices.forEach((invoice) => {
    invoiceObj[invoice.id] = invoice;
  });

  return ids.map((id) => invoiceObj?.[id] ?? []);
};

export const invoicesByIdLoader = () => new Dataloader(batchInvoicesByIdFn);
