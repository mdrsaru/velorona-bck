import moment from 'moment';

import { workscheduleEmitter } from './emitters';
import { TYPES } from '../types';
import { events } from '../config/constants';
import container from '../inversify.config';

import { ILogger } from '../interfaces/common.interface';
import { IWorkscheduleService } from '../interfaces/workschedule.interface';
import { ITimeEntryRepository } from '../interfaces/time-entry.interface';

type UpdateWorkscheduleUsage = {
  startDate: string;
  endDate: string;
  company_id: string;
};

workscheduleEmitter.on(events.updateWorkscheduleUsage, (args: UpdateWorkscheduleUsage) => {
  const operation = events.updateWorkscheduleUsage;
  const logger = container.get<ILogger>(TYPES.Logger);
  const workscheduleService = container.get<IWorkscheduleService>(TYPES.WorkscheduleService);

  logger.init('workschedule.subscriber');

  const company_id = args.company_id;
  const startDate = args.startDate;
  const endDate = args.endDate;

  try {
    workscheduleService
      .updatePayrollUsage({
        company_id,
        startDate,
        endDate,
      })
      .then(() => {
        logger.info({
          operation,
          message: 'Updated workschedule payroll usage',
          data: {
            startDate,
            endDate,
            company_id,
          },
        });
      });
  } catch (err) {
    logger.error({
      operation,
      message: 'Error updating timesheet status',
      data: {
        startDate,
        endDate,
        company_id,
        err,
      },
    });
  }
});

export default workscheduleEmitter;
