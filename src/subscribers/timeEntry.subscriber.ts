import { timesheetEmitter, timeEntryEmitter } from './emitters';
import { TYPES } from '../types';
import { events, TimesheetStatus, TimeEntryApprovalStatus } from '../config/constants';
import container from '../inversify.config';

import { emailSetting } from '../config/constants';
import { IEmailService, ITemplateService, ILogger } from '../interfaces/common.interface';
import ActivityLogRepository from '../repository/activity-log.repository';
import { IUserRepository } from '../interfaces/user.interface';
import activityLog from '../config/inversify/activity-log';

import { ITimeEntryRepository } from '../interfaces/time-entry.interface';
import { IActivityLogRepository } from '../interfaces/activity-log.interface';
import { ITimesheetRepository } from '../interfaces/timesheet.interface';

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

type TimesheetUnlock = {
  timesheet_id: string;
};

timeEntryEmitter.on(events.onTimesheetUnlock, async (args: TimesheetUnlock) => {
  const operation = events.onTimesheetUnlock;

  const timesheetRepository: ITimesheetRepository = container.get<ITimesheetRepository>(TYPES.TimesheetRepository);
  const logger = container.get<ILogger>(TYPES.Logger);
  logger.init('timeEntryEmitter.subscriber');

  const emailService: IEmailService = container.get<IEmailService>(TYPES.EmailService);
  const handlebarsService: ITemplateService = container.get<ITemplateService>(TYPES.HandlebarsService);

  let emailBody: string = emailSetting.unlockTimesheet.body;

  try {
    const timesheet_id = args.timesheet_id;
    const timesheet = await timesheetRepository.getById({
      id: timesheet_id,
      select: ['id', 'weekStartDate', 'weekEndDate'],
      relations: ['user'],
    });

    if (!timesheet) {
      return logger.info({
        operation,
        message: `User Email not found for sending timesheet unlock email`,
        data: {},
      });
    }

    const userHtml = handlebarsService.compile({
      template: emailBody,
      data: {
        week: `${timesheet.weekStartDate} - ${timesheet.weekEndDate}`,
      },
    });

    emailService
      .sendEmail({
        to: timesheet.user.email as string,
        from: emailSetting.fromEmail,
        subject: emailSetting.unlockTimesheet.subject,
        html: userHtml,
      })
      .then((response) => {
        logger.info({
          operation,
          message: `Email response for ${timesheet.user.email}`,
          data: response,
        });
      })
      .catch((err) => {
        logger.error({
          operation,
          message: 'Error sending unlock email',
          data: err,
        });
      });
  } catch (err) {
    logger.error({
      operation,
      message: 'Error sending unlock email',
      data: err,
    });
  }
});

export default timeEntryEmitter;
