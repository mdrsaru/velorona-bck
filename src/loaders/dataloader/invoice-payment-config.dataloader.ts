import Dataloader from 'dataloader';

import { TYPES } from '../../types';
import container from '../../inversify.config';
import { IInvoicePaymentConfigRepository } from '../../interfaces/invoice-payment-config.interface';

const batchInvoicePaymentConfigByIdFn = async (ids: readonly string[]) => {
  const invoicePaymentConfig: IInvoicePaymentConfigRepository = container.get(TYPES.InvoicePaymentConfigRepository);
  const query = { id: ids };
  const invoicePaymentConfigs = await invoicePaymentConfig.getAll({ query });

  const invoicePaymentConfigObj: any = {};

  invoicePaymentConfigs.forEach((company: any) => {
    invoicePaymentConfigObj[company.id] = company;
  });

  return ids.map((id) => invoicePaymentConfigObj[id]);
};

export const invoicePaymentConfigByIdLoader = () => new Dataloader(batchInvoicePaymentConfigByIdFn);
