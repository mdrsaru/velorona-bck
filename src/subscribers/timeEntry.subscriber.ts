import fs from 'fs/promises';

import { timesheetEmitter, timeEntryEmitter } from './emitters';
import { TYPES } from '../types';
import { events, UserStatus } from '../config/constants';
import container from '../inversify.config';

import { emailSetting } from '../config/constants';
import {
  IEmailService,
  ITemplateService,
  ILogger,
  IEmailBasicArgs,
  EmailAttachmentInput,
} from '../interfaces/common.interface';
import ActivityLogRepository from '../repository/activity-log.repository';
import { IUserRepository } from '../interfaces/user.interface';
import moment from 'moment';

import { ITimeEntryRepository } from '../interfaces/time-entry.interface';
import { IActivityLogRepository } from '../interfaces/activity-log.interface';
import { ITimesheetRepository } from '../interfaces/timesheet.interface';
import axios from 'axios';

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
  const startTime = moment(args.startTime).format('ddd MMM DD hh:mm');
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
    await activityLogRepository.create(activityLogData);
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
  const endTime = moment(args.endTime).format('ddd MMM DD hh:mm');

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
    await activityLogRepository.create(activityLogData);
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

  try {
    const timesheet_id = args.timesheet_id;
    const timesheet = await timesheetRepository.getById({
      id: timesheet_id,
      select: ['id', 'weekStartDate', 'weekEndDate'],
      relations: ['user', 'company', 'company.logo', 'user.manager'],
    });

    if (!timesheet) {
      return logger.info({
        operation,
        message: `User Email not found for sending timesheet unlock email`,
        data: {},
      });
    }

    const hasLogo = !!timesheet?.company?.logo_id;

    let managerTemplate = await fs.readFile(`${__dirname}/../../templates/unlock-timesheet-manager.template.html`, {
      encoding: 'utf-8',
    });

    let userTemplate = await fs.readFile(`${__dirname}/../../templates/unlock-timesheet-user.template.html`, {
      encoding: 'utf-8',
    });

    const managerHtml = handlebarsService.compile({
      template: managerTemplate,
      data: {
        weekStartDate: timesheet.weekStartDate,
        weekEndDate: timesheet.weekEndDate,
        user: timesheet.user.firstName,
        manager: timesheet.user?.manager?.firstName,
        hasLogo: hasLogo,
        companyName: timesheet?.company?.name ?? '',
      },
    });

    const userHtml = handlebarsService.compile({
      template: userTemplate,
      data: {
        weekStartDate: timesheet.weekStartDate,
        weekEndDate: timesheet.weekEndDate,
        user: timesheet?.user?.firstName,
        hasLogo: hasLogo,
        companyName: timesheet?.company?.name ?? '',
      },
    });

    let attachments: EmailAttachmentInput[] | undefined;
    if (hasLogo) {
      const image = await axios.get(timesheet?.company?.logo?.url as string, { responseType: 'arraybuffer' });
      const raw = Buffer.from(image.data).toString('base64');

      attachments = [
        {
          content: raw,
          filename: timesheet?.company?.logo.name as string,
          cid: 'logo',
          contentDisposition: 'inline',
          encoding: 'base64',
          // type: 'image/png',
        },
      ];
    }

    const subject = handlebarsService.compile({
      template: emailSetting.unlockTimesheet.subject,
      data: {
        userName: timesheet?.user?.firstName,
        weekEndDate: moment(timesheet?.weekEndDate).format('MM-DD-YYYY'),
      },
    });

    if (timesheet?.user?.status === UserStatus.Active && !timesheet?.user?.archived) {
      let promises: any = [];

      if (timesheet.user?.manager?.email) {
        const obj: IEmailBasicArgs = {
          to: timesheet.user?.manager?.email as string,
          from: `${timesheet?.company?.name} ${emailSetting.fromEmail}`,
          subject: subject,
          html: managerHtml,
          ...(hasLogo && {
            attachments,
          }),
        };

        const sendToManager = emailService.sendEmail(obj);

        promises.push(sendToManager);
      }

      const userObj: IEmailBasicArgs = {
        to: timesheet.user?.email as string,
        from: `${timesheet?.company?.name} ${emailSetting.fromEmail}`,
        subject: subject,
        html: userHtml,
        ...(hasLogo && {
          attachments,
        }),
      };

      promises.push(emailService.sendEmail(userObj));

      Promise.all(promises)
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
            message: 'Error sending timesheet submit email',
            data: err,
          });
        });
    }
  } catch (err) {
    logger.error({
      operation,
      message: 'Error sending timesheet submit email',
      data: err,
    });
  }
});

export default timeEntryEmitter;
