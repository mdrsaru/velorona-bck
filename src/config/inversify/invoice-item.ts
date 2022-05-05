import { ContainerModule, interfaces } from 'inversify';

import { TYPES } from '../../types';

// interface
import { IInvoiceItemRepository } from '../../interfaces/invoice-item.interface';

// InvoiceItem
import InvoiceItemRepository from '../../repository/invoice-item.repository';
import { InvoiceItemResolver } from '../../graphql/resolvers/invoice-item.resolver';

const invoiceItem = new ContainerModule((bind: interfaces.Bind, unbind: interfaces.Unbind) => {
  bind<IInvoiceItemRepository>(TYPES.InvoiceItemRepository).to(InvoiceItemRepository);
  bind<InvoiceItemResolver>(InvoiceItemResolver).to(InvoiceItemResolver).inSingletonScope();
});

export default invoiceItem;
