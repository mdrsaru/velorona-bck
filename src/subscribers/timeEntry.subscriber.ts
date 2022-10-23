import fs from 'fs/promises';

import { timesheetEmitter, timeEntryEmitter } from './emitters';
import { TYPES } from '../types';
import { events } from '../config/constants';
import container from '../inversify.config';

import { emailSetting } from '../config/constants';
import { IEmailService, ITemplateService, ILogger, IEmailBasicArgs } from '../interfaces/common.interface';
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

  let emailBody: string = emailSetting.unlockTimesheet.body;

  try {
    const timesheet_id = args.timesheet_id;
    const timesheet = await timesheetRepository.getById({
      id: timesheet_id,
      select: ['id', 'weekStartDate', 'weekEndDate'],
      relations: ['user', 'company', 'company.logo'],
    });

    if (!timesheet) {
      return logger.info({
        operation,
        message: `User Email not found for sending timesheet unlock email`,
        data: {},
      });
    }

    const hasLogo = !!timesheet?.company?.logo_id;

    let emailTemplate = await fs.readFile(`${__dirname}/../../templates/unlock-timesheet-template.html`, {
      encoding: 'utf-8',
    });

    const userHtml = handlebarsService.compile({
      template: emailTemplate,
      data: {
        week: `${timesheet.weekStartDate} - ${timesheet.weekEndDate}`,
        user: timesheet.user.firstName,
        hasLogo: hasLogo,
        companyName: timesheet?.company?.name ?? '',
      },
    });

    const logo = await fs.readFile(`${__dirname}/../../public/logo.png`, { encoding: 'base64' });

    const obj: IEmailBasicArgs = {
      to: timesheet.user.email as string,
      from: emailSetting.fromEmail,
      subject: emailSetting.unlockTimesheet.subject,
      html: userHtml,
    };

    if (hasLogo) {
      const image = await axios.get(timesheet?.company?.logo?.url as string, { responseType: 'arraybuffer' });
      const raw = Buffer.from(image.data).toString('base64');

      obj.attachments = [
        {
          content: raw,
          filename: timesheet?.company?.logo.name as string,
          content_id: 'logo',
          disposition: 'inline',
          // type: 'image/png',
        },
      ];
    }

    emailService
      .sendEmail(obj)
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

timeEntryEmitter.on(events.onTimesheetSubmit, async (args: TimesheetUnlock) => {
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

    let emailTemplate = await fs.readFile(`${__dirname}/../../templates/submit-timesheet-template.html`, {
      encoding: 'utf-8',
    });

    const userHtml = handlebarsService.compile({
      template: emailTemplate,
      data: {
        week: `${timesheet.weekStartDate} - ${timesheet.weekEndDate}`,
        user: `${timesheet.user.firstName} ${timesheet.user.lastName} `,
        manager: timesheet.user?.manager?.firstName,
        hasLogo: hasLogo,
        companyName: timesheet?.company?.name ?? '',
      },
    });

    const obj: IEmailBasicArgs = {
      to: timesheet.user?.manager?.email as string,
      from: emailSetting.fromEmail,
      subject: emailSetting.submitTimesheet.subject,
      html: userHtml,
    };

    if (hasLogo) {
      const image = await axios.get(timesheet?.company?.logo?.url as string, { responseType: 'arraybuffer' });
      const raw = Buffer.from(image.data).toString('base64');

      obj.attachments = [
        {
          content: raw,
          filename: timesheet?.company?.logo.name as string,
          content_id: 'logo',
          disposition: 'inline',
          // type: 'image/png',
        },
      ];
    }

    emailService
      .sendEmail(obj)
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
