import { timesheetEmitter, timeEntryEmitter } from './emitters';
import { TYPES } from '../types';
import { events, TimesheetStatus, TimeEntryApprovalStatus } from '../config/constants';
import container from '../inversify.config';

import { ILogger } from '../interfaces/common.interface';
import { ITimeEntryRepository } from '../interfaces/time-entry.interface';
import { IActivityLogRepository } from '../interfaces/activityLog.interface';
import ActivityLogRepository from '../repository/activityLog.repository';
import { ITaskRepository } from '../interfaces/task.interface';
import { IUserRepository } from '../interfaces/user.interface';
import activityLog from '../config/inversify/activityLog';

type TimeEntryStop = {
  created_by: string;
  task_id: string;
  duration: number;
  company_id: string;
};

timeEntryEmitter.on(events.onTimeEntryStop, async (args: TimeEntryStop) => {
  const operation = events.onTimeEntryStop;

  const taskRepository: ITaskRepository = container.get<ITaskRepository>(TYPES.TaskRepository);
  const userRepository: IUserRepository = container.get<IUserRepository>(TYPES.UserRepository);
  const activityLogRepository: IActivityLogRepository = container.get<IActivityLogRepository>(
    TYPES.ActivityLogRepository
  );
  const logger = container.get<ILogger>(TYPES.Logger);
  logger.init('timEntry.subscriber');

  const created_by = args.created_by;
  const task_id = args.task_id;
  const duration = args.duration;
  const company_id = args.company_id;

  let task = await taskRepository.getById({ id: task_id });
  let user = await userRepository.getById({ id: created_by });

  function secondsToHms(duration: any) {
    const sec = duration;
    let hours = Math.floor(sec / 3600);
    let minutes = Math.floor((sec - hours * 3600) / 60);
    return hours + ' Hrs ' + minutes + ' min';
  }

  const totalTime = secondsToHms(duration);
  let message = ` tracked time ${totalTime} on task <b>${task?.name}</b>`;

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

export default timesheetEmitter;
