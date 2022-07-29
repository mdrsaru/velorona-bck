import cron from 'cron';
import moment from 'moment';

import { TYPES } from '../types';
import container from '../inversify.config';
import { IInvoiceService } from '../interfaces/invoice.interface';
import { ILogger } from '../interfaces/common.interface';

const CronJob = cron.CronJob;

export default (): void => {
  const operation = 'scheduleInvoice';
  const logger = container.get<ILogger>(TYPES.Logger);
  logger.init('cron.loader');

  const invoiceService = container.get<IInvoiceService>(TYPES.InvoiceService);

  new CronJob(
    '0 0 1 * * *',
    function () {
      try {
        invoiceService
          .createInvoiceFromScheduleDate({
            date: moment().format('YYYY-MM-DD'),
          })
          .then((invoices) => {
            logger.info({
              operation,
              message: `Created invoice from schedule`,
              data: {},
            });
          });
      } catch (err) {
        return logger.error({
          operation,
          message: `Error generating invoice from schedule`,
          data: {},
        });
      }
    },
    null,
    true,
    'Asia/Kathmandu'
  );
};
