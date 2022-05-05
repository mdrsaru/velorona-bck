import { ContainerModule, interfaces } from 'inversify';

import { TYPES } from '../../types';

// interface
import { IInvoiceRepository, IInvoiceService } from '../../interfaces/invoice.interface';

// Invoice
import InvoiceRepository from '../../repository/invoice.repository';
import InvoiceService from '../../services/invoice.service';

// Resolvers
import { InvoiceResolver } from '../../graphql/resolvers/invoice.resolver';

const invoice = new ContainerModule((bind: interfaces.Bind, unbind: interfaces.Unbind) => {
  bind<IInvoiceRepository>(TYPES.InvoiceRepository).to(InvoiceRepository);
  bind<IInvoiceService>(TYPES.InvoiceService).to(InvoiceService);
  bind<InvoiceResolver>(InvoiceResolver).to(InvoiceResolver).inSingletonScope();
});

export default invoice;
