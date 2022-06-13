import { payRateEmitter } from './emitters';
import { TYPES } from '../types';
import { events } from '../config/constants';
import container from '../inversify.config';

import { ILogger } from '../interfaces/common.interface';
import { ITimeEntryRepository } from '../interfaces/time-entry.interface';
import { IUserRepository } from '../interfaces/user.interface';

type UserPayRate = {
  project_id: string;
  created_by: string;
  hourlyRate: number;
};

payRateEmitter.on(events.onPayRateCreateUpdate, async (args: UserPayRate) => {
  const operation = events.onPayRateCreateUpdate;

  const userRepository: IUserRepository = container.get<IUserRepository>(TYPES.UserRepository);
  const timeEntryRepository: ITimeEntryRepository = container.get<ITimeEntryRepository>(TYPES.TimeEntryRepository);
  const logger = container.get<ILogger>(TYPES.Logger);
  logger.init('pay-rate.subscriber');

  logger.info({
    operation,
    message: `Payrate emitter ${events.onPayRateCreateUpdate} started for hourly rate`,
    data: {},
  });

  try {
    const user = await userRepository.getById({
      id: args.created_by,
      select: ['company_id'],
    });

    if (user && user?.company_id) {
      const entries = await timeEntryRepository.countEntities({
        query: {
          project_id: args.project_id,
          company_id: user.company_id,
          created_by: args.created_by,
        },
      });

      if (entries) {
        await timeEntryRepository.updateHourlyRate({
          project_id: args.project_id,
          company_id: user.company_id,
          created_by: args.created_by,
          hourlyRate: args.hourlyRate,
        });

        logger.info({
          operation,
          message: 'Hourly rate has been successfully updated.',
          data: {},
        });
      }
    }
  } catch (err) {
    logger.error({
      operation,
      message: 'Error updating timesheet status',
      data: {
        err,
      },
    });
  }
});

export default payRateEmitter;
