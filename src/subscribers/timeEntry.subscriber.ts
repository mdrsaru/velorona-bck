import { timesheetEmitter, timeEntryEmitter } from './emitters';
import { TYPES } from '../types';
import { events } from '../config/constants';
import container from '../inversify.config';

import { ILogger } from '../interfaces/common.interface';
import { IActivityLogRepository } from '../interfaces/activity-log.interface';
import { IUserRepository } from '../interfaces/user.interface';
import moment from 'moment';

type TimeEntryStop = {
  created_by: string;
  duration: number;
  company_id: string;
};

timeEntryEmitter.on(events.onTimeEntryStop, async (args: TimeEntryStop) => {
  const operation = events.onTimeEntryStop;

  const userRepository: IUserRepository = container.get<IUserRepository>(TYPES.UserRepository);
  const activityLogRepository: IActivityLogRepository = container.get<IActivityLogRepository>(
    TYPES.ActivityLogRepository
  );
  const logger = container.get<ILogger>(TYPES.Logger);
  logger.init('timEntry.subscriber');

  const created_by = args.created_by;
  const duration = args.duration;
  const company_id = args.company_id;

  let user = await userRepository.getById({ id: created_by });

  function secondsToHms(duration: any) {
    const sec = duration;
    let hours = Math.floor(sec / 3600);
    let minutes = Math.floor((sec - hours * 3600) / 60);
    return hours + ' Hrs ' + minutes + ' min';
  }

  const totalTime = secondsToHms(duration);
  // TODO: Removed task. Need to add project instead
  let message = ` tracked time ${totalTime}`;

  let activityLogData = {
    message: message,
    type: 'TimeEntry',
    company_id: company_id,
    user_id: created_by,
  };
  logger.info({
    operation,
    message: `TimeEntry emitter ${events.onTimeEntryStop} started`,
    data: activityLogData,
  });

  try {
    await activityLogRepository.create(activityLogData);

    logger.info({
      operation,
      message: `TimeEntry stopped by user`,
      data: activityLogData,
    });
  } catch (err) {
    logger.error({
      operation,
      message: 'Error creating activity Log',
      data: {
        err,
      },
    });
  }
});

type CheckInInput = {
  created_by: string;
  company_id: string;
  startTime: Date;
  project: string;
};

timeEntryEmitter.on(events.onCheckIn, async (args: CheckInInput) => {
  const operation = events.onCheckIn;

  const activityLogRepository: IActivityLogRepository = container.get<IActivityLogRepository>(
    TYPES.ActivityLogRepository
  );
  const logger = container.get<ILogger>(TYPES.Logger);
  logger.init('timEntry.subscriber');

  const created_by = args.created_by;
  const company_id = args.company_id;
  const startTime = moment(args.startTime).format('ddd MMM DD HH:MM');
  const project = args.project;

  let message = ` Checked in at ${startTime} on Project ${project}`;

  let activityLogData = {
    message: message,
    type: 'CheckIn',
    company_id: company_id,
    user_id: created_by,
  };
  logger.info({
    operation,
    message: `TimeEntry emitter ${events.onCheckIn} started`,
    data: activityLogData,
  });

  try {
    const activityLog = await activityLogRepository.create(activityLogData);
    console.log(activityLog);
    logger.info({
      operation,
      message: `Checked in by user`,
      data: activityLogData,
    });
  } catch (err) {
    logger.error({
      operation,
      message: 'Error creating activity Log',
      data: {
        err,
      },
    });
  }
});

type CheckoutInput = {
  created_by: string;
  company_id: string;
  endTime: Date;
  duration: number;
};

timeEntryEmitter.on(events.onCheckOut, async (args: CheckoutInput) => {
  const operation = events.onCheckIn;

  const activityLogRepository: IActivityLogRepository = container.get<IActivityLogRepository>(
    TYPES.ActivityLogRepository
  );
  const logger = container.get<ILogger>(TYPES.Logger);
  logger.init('timEntry.subscriber');

  const created_by = args.created_by;
  const company_id = args.company_id;
  const endTime = moment(args.endTime).format('ddd MMM DD HH:MM');

  let message = ` Checked out at ${endTime}`;

  let activityLogData = {
    message: message,
    type: 'CheckOut',
    company_id: company_id,
    user_id: created_by,
  };
  logger.info({
    operation,
    message: `TimeEntry emitter ${events.onCheckIn} started`,
    data: activityLogData,
  });

  try {
    const activityLog = await activityLogRepository.create(activityLogData);
    console.log(activityLog);
    logger.info({
      operation,
      message: `Checked in by user`,
      data: activityLogData,
    });
  } catch (err) {
    logger.error({
      operation,
      message: 'Error creating activity Log',
      data: {
        err,
      },
    });
  }
});

export default timesheetEmitter;
