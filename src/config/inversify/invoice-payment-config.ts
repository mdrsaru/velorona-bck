import { ContainerModule, interfaces } from 'inversify';

import { TYPES } from '../../types';

// interface
import {
  IInvoicePaymentConfigRepository,
  IInvoicePaymentConfigService,
} from '../../interfaces/invoice-payment-config.interface';

// InvoicePaymentConfig
import InvoicePaymentConfigRepository from '../../repository/invoice-payment-config.repository';
import InvoicePaymentConfigService from '../../services/invoice-payment-service.service';

// Resolvers
import { InvoicePaymentConfigResolver } from '../../graphql/resolvers/invoice-payment-config.resolver';

const client = new ContainerModule((bind: interfaces.Bind, unbind: interfaces.Unbind) => {
  bind<IInvoicePaymentConfigRepository>(TYPES.InvoicePaymentConfigRepository).to(InvoicePaymentConfigRepository);
  bind<IInvoicePaymentConfigService>(TYPES.InvoicePaymentConfigService).to(InvoicePaymentConfigService);
  bind<InvoicePaymentConfigResolver>(InvoicePaymentConfigResolver).to(InvoicePaymentConfigResolver).inSingletonScope();
});

export default client;
