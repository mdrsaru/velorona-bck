import Dataloader from 'dataloader';

import { TYPES } from '../../types';
import container from '../../inversify.config';
import { IInvoiceItemRepository } from '../../interfaces/invoice-item.interface';
import InvoiceItem from '../../entities/invoice-item.entity';

const batchItemsByInvoiceIdIdFn = async (ids: readonly string[]) => {
  const invoiceItemRepo: IInvoiceItemRepository = container.get(TYPES.InvoiceItemRepository);
  const query = { invoice_id: ids };
  const items = await invoiceItemRepo.getAll({ query });

  type InvoiceObj = {
    [id: string]: InvoiceItem[];
  };

  const invoiceObj: InvoiceObj = items.reduce((acc: InvoiceObj, current) => {
    if (acc[current.invoice_id]) {
      acc[current.invoice_id].push(current);
    } else {
      acc[current.invoice_id] = [current];
    }

    return acc;
  }, {});

  return ids.map((id) => invoiceObj?.[id] ?? []);
};

export const itemsByInvoiceIdLoader = () => new Dataloader(batchItemsByInvoiceIdIdFn);
