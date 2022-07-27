import { define } from 'typeorm-seeding';

import InvoicePaymentConfig from '../../../entities/invoice-payment-config.entity';

define(InvoicePaymentConfig, () => {
  const config = new InvoicePaymentConfig();

  return config;
});
