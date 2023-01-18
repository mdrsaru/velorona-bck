import cron from 'cron';
import moment from 'moment';

import { TYPES } from '../types';
import container from '../inversify.config';
import { IInvoiceService } from '../interfaces/invoice.interface';
import { ILogger } from '../interfaces/common.interface';
import { ITimesheetService } from '../interfaces/timesheet.interface';
import { IWorkscheduleRepository } from '../interfaces/workschedule.interface';
import { ICompanyService } from '../interfaces/company.interface';
import { ISubscriptionService } from '../interfaces/subscription.interface';

const CronJob = cron.CronJob;

export default (): void => {
  const logger = container.get<ILogger>(TYPES.Logger);
  logger.init('cron.loader');

  const invoiceService = container.get<IInvoiceService>(TYPES.InvoiceService);
  const timesheetService = container.get<ITimesheetService>(TYPES.TimesheetService);
  const companyService = container.get<ICompanyService>(TYPES.CompanyService);
  const workscheduleRepository = container.get<IWorkscheduleRepository>(TYPES.WorkscheduleRepository);
  const subscriptionService = container.get<ISubscriptionService>(TYPES.SubscriptionService);

  /**
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
  */

  new CronJob(
    '0 5 * * MON',
    function () {
      const operation = 'bulkCreate';

      try {
        timesheetService
          .bulkCreate({
            date: moment().format('YYYY-MM-DD'),
          })
          .then((timesheet) => {
            logger.info({
              operation,
              message: `Timesheet created on every monday`,
              data: {},
            });
          });
      } catch (err) {
        return logger.error({
          operation,
          message: `Error creating timesheet`,
          data: {},
        });
      }
    },
    null,
    true,
    'Asia/Kathmandu'
  );

  /**
   * Work schedule: Update status to Closed
   */
  new CronJob(
    '50 23 * * 0',
    function () {
      const operation = 'openCloseSchedules';
      const date = moment().format('YYYY-MM-DD');

      try {
        workscheduleRepository
          .openCloseSchedules({
            status: 'Closed',
            date,
          })
          .then(() => {
            logger.info({
              operation,
              message: `Updated workschedules with Closed status`,
              data: {
                date,
              },
            });
          })
          .catch((err) => {
            logger.error({
              operation,
              message: 'Error closing schedules',
              data: {
                date,
                err,
              },
            });
          });
      } catch (err) {
        logger.error({
          operation,
          message: 'Error closing schedules',
          data: {
            date,
            err,
          },
        });
      }
    },
    null,
    true,
    'UTC'
  );

  /**
   * Work schedule: Update status to Open
   */
  new CronJob(
    '0 1 * * *',
    function () {
      const operation = 'openCloseSchedules';
      const date = moment().format('YYYY-MM-DD');

      try {
        workscheduleRepository
          .openCloseSchedules({
            status: 'Open',
            date,
          })
          .then(() => {
            logger.info({
              operation,
              message: `Updated workschedules with Open status`,
              data: {
                date,
              },
            });
          })
          .catch((err) => {
            logger.error({
              operation,
              message: 'Error opening schedules',
              data: {
                date,
                err,
              },
            });
          });
      } catch (err) {
        logger.error({
          operation,
          message: 'Error opening schedules',
          data: {
            date,
            err,
          },
        });
      }
    },
    null,
    true,
    'UTC'
  );

  /**
   * Timesheet submit reminder to user
   */
  new CronJob(
    '0 1 * * *',
    function () {
      const operation = 'timesheetSubmitReminder';
      const date = moment().format('YYYY-MM-DD');

      try {
        timesheetService
          .submitReminder({
            date,
          })
          .then(() => {
            logger.info({
              operation,
              message: `Timesheet submit reminder send sucessfully`,
              data: {
                date,
              },
            });
          })
          .catch((err) => {
            logger.error({
              operation,
              message: 'Error sending timesheet reminder',
              data: {
                date,
                err,
              },
            });
          });
      } catch (err) {
        logger.error({
          operation,
          message: 'Error sending timesheet reminder',
          data: {
            date,
            err,
          },
        });
      }
    },
    null,
    true,
    'UTC'
  );

  /**
   * Timesheet approve/reject reminder to task manager
   */
  new CronJob(
    '0 1 * * *',
    function () {
      const operation = 'timesheetapproveReminder';
      const date = moment().format('YYYY-MM-DD');
      try {
        timesheetService
          .approveReminder({
            date,
          })
          .then(() => {
            logger.info({
              operation,
              message: `Timesheet approve/reject reminder send sucessfully`,
              data: {
                date,
              },
            });
          })
          .catch((err) => {
            logger.error({
              operation,
              message: 'Error sending timesheet reminder',
              data: {
                date,
                err,
              },
            });
          });
      } catch (err) {
        logger.error({
          operation,
          message: 'Error sending timesheet reminder',
          data: {
            date,
            err,
          },
        });
      }
    },
    null,
    true,
    'UTC'
  );

  /**
   * Company subscription due date reminder
   */
  new CronJob(
    '0 1 * * *',
    function () {
      const operation = 'subscriptionEndReminder';
      const date = moment().format('YYYY-MM-DD');
      try {
        companyService
          .subscriptionReminder({
            date,
          })
          .then(() => {
            logger.info({
              operation,
              message: `Subscription end reminder send sucessfully`,
              data: {
                date,
              },
            });
          })
          .catch((err) => {
            logger.error({
              operation,
              message: 'Error sending subscription end reminder',
              data: {
                date,
                err,
              },
            });
          });
      } catch (err) {
        logger.error({
          operation,
          message: 'Error sending subscription end reminder',
          data: {
            date,
            err,
          },
        });
      }
    },
    null,
    true,
    'UTC'
  );

  /**
   * Subscription payment reminder
   */
  new CronJob(
    '0 1 * * *',
    function () {
      const operation = 'subscriptionPaymentReminder';
      const date = moment().format('YYYY-MM-DD');
      try {
        subscriptionService
          .subscriptionPaymentReminder({
            date,
          })
          .then(() => {
            logger.info({
              operation,
              message: `Subscription reminder send sucessfully`,
              data: {
                date,
              },
            });
          })
          .catch((err) => {
            logger.error({
              operation,
              message: 'Error sending subscription reminder',
              data: {
                date,
                err,
              },
            });
          });
      } catch (err) {
        logger.error({
          operation,
          message: 'Error sending timesheet reminder',
          data: {
            date,
            err,
          },
        });
      }
    },
    null,
    true,
    'UTC'
  );
};
