import moment from 'moment';
import fs from 'fs/promises';

import { timesheetEmitter } from './emitters';
import { TYPES } from '../types';
import {
  events,
  TimesheetStatus,
  TimeEntryApprovalStatus,
  AttachedTimesheetStatus,
  InvoiceSchedule,
  emailSetting,
  UserStatus,
} from '../config/constants';
import container from '../inversify.config';

import {
  IEmailBasicArgs,
  IEmailService,
  ILogger,
  ITemplateService,
  EmailAttachmentInput,
} from '../interfaces/common.interface';
import { ITimesheetRepository } from '../interfaces/timesheet.interface';
import { ITimeEntryRepository } from '../interfaces/time-entry.interface';
import { IUserRepository } from '../interfaces/user.interface';
import { IActivityLogRepository } from '../interfaces/activity-log.interface';
import { IClientRepository } from '../interfaces/client.interface';
import { IAttachedTimesheetRepository } from '../interfaces/attached-timesheet.interface';
import axios from 'axios';
import Timesheet from '../entities/timesheet.entity';

type TimesheetApprove = {
  timesheet_id: string;
  approver_id: string;
  lastApprovedAt: Date;
  reason?: string;
};

type TimesheetSubmit = {
  timesheet_id: string;
};

timesheetEmitter.on(events.onTimeEntriesApprove, async (args: TimesheetApprove) => {
  const operation = events.onTimeEntriesApprove;

  const timesheetRepository: ITimesheetRepository = container.get<ITimesheetRepository>(TYPES.TimesheetRepository);
  const timeEntryRepository: ITimeEntryRepository = container.get<ITimeEntryRepository>(TYPES.TimeEntryRepository);
  const attachedTimesheetRepository: IAttachedTimesheetRepository = container.get<IAttachedTimesheetRepository>(
    TYPES.AttachedTimesheetRepository
  );
  const userRepository: IUserRepository = container.get<IUserRepository>(TYPES.UserRepository);
  const activityLogRepository: IActivityLogRepository = container.get<IActivityLogRepository>(
    TYPES.ActivityLogRepository
  );
  const emailService: IEmailService = container.get<IEmailService>(TYPES.EmailService);
  const handlebarsService: ITemplateService = container.get<ITemplateService>(TYPES.HandlebarsService);

  const logger = container.get<ILogger>(TYPES.Logger);
  logger.init('timesheet.subscriber');

  const timesheet_id = args.timesheet_id;
  const approver_id = args.approver_id;
  const lastApprovedAt = args.lastApprovedAt;

  logger.info({
    operation,
    message: `Timesheet emitter ${events.onTimeEntriesApprove} started`,
    data: {
      timesheet_id,
    },
  });

  try {
    const approvedEntriesCount = await timeEntryRepository.countEntities({
      query: {
        timesheet_id,
        approvalStatus: TimeEntryApprovalStatus.Approved,
      },
    });

    const rejectedEntriesCount = await timeEntryRepository.countEntities({
      query: {
        timesheet_id,
        approvalStatus: TimeEntryApprovalStatus.Rejected,
      },
    });

    const allTimeEntries = await timeEntryRepository.countEntities({
      query: {
        timesheet_id,
      },
    });
    let status: TimesheetStatus;
    let attachedTimesheetStatus: AttachedTimesheetStatus;

    if (approvedEntriesCount === allTimeEntries) {
      status = TimesheetStatus.Approved;
      attachedTimesheetStatus = AttachedTimesheetStatus.Approved;
    } else if (rejectedEntriesCount === allTimeEntries) {
      status = TimesheetStatus.Rejected;
      attachedTimesheetStatus = AttachedTimesheetStatus.Rejected;
    } else if (approvedEntriesCount) {
      status = TimesheetStatus.PartiallyApproved;
      attachedTimesheetStatus = AttachedTimesheetStatus.PartiallyApproved;
    } else {
      status = TimesheetStatus.Open;
      attachedTimesheetStatus = AttachedTimesheetStatus.Pending;
    }

    await timesheetRepository.update({
      id: timesheet_id,
      status,
      approver_id,
      lastApprovedAt,
    });

    const attachedTimesheet = await attachedTimesheetRepository.getAll({
      timesheet_id: timesheet_id,
    });

    await attachedTimesheetRepository.update({
      id: attachedTimesheet[0]?.id,
      status: attachedTimesheetStatus,
    });

    const timesheet = await timesheetRepository.getById({
      id: timesheet_id,
      relations: ['user', 'company', 'company.logo', 'user.manager'],
    });

    if (!timesheet) {
      return logger.info({
        operation,
        message: `User Email not found for sending timesheet unlock email`,
        data: {},
      });
    }
    let date =
      moment(timesheet?.weekStartDate).format('MMM D') + ' - ' + moment(timesheet?.weekEndDate).format('MMM D');

    let company_id = timesheet?.company_id;
    let employee, activityLogData: any;

    if (timesheet) {
      employee = await userRepository.getById({ id: timesheet?.user_id });
    }

    if (status === TimesheetStatus.Approved) {
      let message = ` appproved <b>Timesheet of ${employee?.firstName} ${employee?.lastName} </b> for ${date}`;
      activityLogData = {
        message: message,
        type: TimesheetStatus.Approved,
        company_id: company_id,
        user_id: approver_id,
      };
    } else if (status === TimesheetStatus.PartiallyApproved) {
      let message = `partially approved <b> Timesheet of ${employee?.firstName} ${employee?.lastName} </b> for ${date}`;
      activityLogData = {
        message: message,
        type: TimesheetStatus.PartiallyApproved,
        company_id: company_id,
        user_id: approver_id,
      };
    }

    try {
      await activityLogRepository.create(activityLogData);

      logger.info({
        operation,
        message: `TimeEntry reject or accept by appover`,
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

    const hasLogo = !!timesheet?.company?.logo_id;

    let emailTemplate = await fs.readFile(`${__dirname}/../../templates/approveReject-timesheet-template.html`, {
      encoding: 'utf-8',
    });

    const names = [
      timesheet?.user?.firstName ?? '',
      timesheet?.user?.middleName ?? '',
      timesheet?.user?.lastName ?? '',
    ];

    const timesheetHtml = handlebarsService.compile({
      template: emailTemplate,
      data: {
        week: `${timesheet.weekStartDate} - ${timesheet.weekEndDate}`,
        user: names.join(' '),
        manager: timesheet.user?.manager?.firstName,
        hasLogo: hasLogo,
        status: status,
        companyName: timesheet?.company?.name ?? '',
      },
    });

    let employeeTemplate = await fs.readFile(`${__dirname}/../../templates/approve-reject-timesheet-employee.html`, {
      encoding: 'utf-8',
    });

    const employeeHtml = handlebarsService.compile({
      template: employeeTemplate,
      data: {
        week: `${timesheet.weekStartDate} - ${timesheet.weekEndDate}`,
        name: names.join(' '),
        hasLogo: hasLogo,
        status: status,
        companyName: timesheet?.company?.name ?? '',
        reason: args?.reason,
        needReason: timesheet?.status === TimesheetStatus.Rejected && args.reason,
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
        },
      ];
    }

    const promises: any = [];
    if (timesheet?.user?.manager?.email) {
      const obj: IEmailBasicArgs = {
        to: timesheet.user?.manager?.email as string,
        from: `${timesheet?.company?.name} ${emailSetting.fromEmail}`,
        subject: `Timesheet ${status}`,
        html: timesheetHtml,
        ...(hasLogo && {
          attachments,
        }),
      };

      promises.push(emailService.sendEmail(obj));
    }

    const employeeObj: IEmailBasicArgs = {
      to: timesheet.user?.email as string,
      from: `${timesheet?.company?.name} ${emailSetting.fromEmail}`,
      subject: `Timesheet ${status}`,
      html: employeeHtml,
      ...(hasLogo && {
        attachments,
      }),
    };

    promises.push(emailService.sendEmail(employeeObj));

    Promise.all(promises)
      .then((response) => {
        logger.info({
          operation,
          message: `Email response for ${timesheet.user?.manager?.email}`,
          data: response,
        });
      })
      .catch((err) => {
        logger.error({
          operation,
          message: 'Error sending approve/reject email',
          data: err,
        });
      });
  } catch (err) {
    logger.error({
      operation,
      message: 'Error updating timesheet status',
      data: {
        timesheet_id,
        err,
      },
    });
  }
});

type TimesheetCreate = {
  timesheet_id: string;
  client_id: string;
  weekStartDate: string | Date;
};

timesheetEmitter.on(events.sendTimesheetSubmitEmail, async (args: TimesheetSubmit) => {
  const operation = events.sendTimesheetSubmitEmail;

  const timesheetRepository: ITimesheetRepository = container.get<ITimesheetRepository>(TYPES.TimesheetRepository);
  const logger = container.get<ILogger>(TYPES.Logger);
  logger.init('timesheet.subscriber');

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

    let userTemplate = await fs.readFile(`${__dirname}/../../templates/timesheet-submit-user.html`, {
      encoding: 'utf-8',
    });

    const managerHtml = handlebarsService.compile({
      template: emailTemplate,
      data: {
        week: `${timesheet.weekStartDate} - ${timesheet.weekEndDate}`,
        user: `${timesheet.user.firstName} ${timesheet.user.lastName} `,
        manager: timesheet.user?.manager?.firstName,
        hasLogo: hasLogo,
        companyName: timesheet?.company?.name ?? '',
      },
    });

    const names = [
      timesheet?.user?.firstName ?? '',
      timesheet?.user?.middleName ?? '',
      timesheet?.user?.lastName ?? '',
    ];
    const userHtml = handlebarsService.compile({
      template: userTemplate,
      data: {
        week: `${timesheet.weekStartDate} - ${timesheet.weekEndDate}`,
        hasLogo: hasLogo,
        companyName: timesheet?.company?.name ?? '',
        name: names.join(' '),
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
    if (timesheet?.user?.status === UserStatus.Active && !timesheet?.user?.archived) {
      let promises: any = [];
      if (timesheet.user?.manager?.email) {
        const obj: IEmailBasicArgs = {
          to: timesheet.user?.manager?.email as string,
          from: `${timesheet?.company?.name} ${emailSetting.fromEmail}`,
          subject: emailSetting.submitTimesheet.subject,
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
        subject: emailSetting.submitTimesheet.subject,
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

type TimesheetReminderUsage = {
  timesheet: Timesheet;
};

timesheetEmitter.on(events.onTimesheetSubmitReminder, async (args: TimesheetReminderUsage) => {
  const operation = events.sendTimesheetSubmitEmail;

  const timesheetRepository: ITimesheetRepository = container.get<ITimesheetRepository>(TYPES.TimesheetRepository);
  const logger = container.get<ILogger>(TYPES.Logger);
  logger.init('timesheet.subscriber');

  const emailService: IEmailService = container.get<IEmailService>(TYPES.EmailService);
  const handlebarsService: ITemplateService = container.get<ITemplateService>(TYPES.HandlebarsService);

  const timesheet = args.timesheet;

  try {
    const hasLogo = !!timesheet?.company?.logo_id;

    let emailTemplate = await fs.readFile(`${__dirname}/../../templates/submit-timesheet-reminder.template.html`, {
      encoding: 'utf-8',
    });
    const timesheetHtml = handlebarsService.compile({
      template: emailTemplate,
      data: {
        hasLogo: hasLogo,
        companyName: timesheet?.company?.name ?? '',
        weekStartDate: moment(timesheet.weekStartDate).format('MMM DD,YYYY'),
        weekEndDate: moment(timesheet.weekEndDate).format('MMM DD,YYYY'),
        user: timesheet?.user?.firstName,
      },
    });
    const obj: IEmailBasicArgs = {
      to: timesheet?.user.email ?? '',
      from: `${timesheet?.company?.name} ${emailSetting.fromEmail}`,
      subject: emailSetting.submitTimesheetReminder.subject,
      html: timesheetHtml,
    };

    if (hasLogo) {
      const image = await axios.get(timesheet?.company?.logo?.url as string, {
        responseType: 'arraybuffer',
      });
      const raw = Buffer.from(image.data).toString('base64');

      obj.attachments = [
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
    if (timesheet?.user?.status === UserStatus.Active && !timesheet?.user?.archived) {
      emailService
        .sendEmail(obj)
        .then((response) => {
          logger.info({
            operation,
            message: `Email response for ${timesheet?.user?.email}`,
            data: response,
          });
        })
        .catch((err) => {
          logger.error({
            operation,
            message: 'Error sending workschedule added email',
            data: err,
          });
        });
    }
  } catch (err) {
    logger.error({
      operation,
      message: 'Error on creating workschedule detail',
      data: {
        timesheet,
        err,
      },
    });
  }
});

timesheetEmitter.on(events.onTimesheetApproveReminder, async (args: TimesheetReminderUsage) => {
  const operation = events.sendTimesheetSubmitEmail;

  const timesheetRepository: ITimesheetRepository = container.get<ITimesheetRepository>(TYPES.TimesheetRepository);
  const logger = container.get<ILogger>(TYPES.Logger);
  logger.init('timesheet.subscriber');

  const emailService: IEmailService = container.get<IEmailService>(TYPES.EmailService);
  const handlebarsService: ITemplateService = container.get<ITemplateService>(TYPES.HandlebarsService);

  const timesheet = args.timesheet;

  try {
    const hasLogo = !!timesheet?.company?.logo_id;

    let emailTemplate = await fs.readFile(`${__dirname}/../../templates/approve-timesheet-reminder.template.html`, {
      encoding: 'utf-8',
    });

    const names = [
      timesheet?.user?.firstName ?? '',
      timesheet?.user?.middleName ?? '',
      timesheet?.user?.lastName ?? '',
    ];

    const timesheetHtml = handlebarsService.compile({
      template: emailTemplate,
      data: {
        hasLogo: hasLogo,
        companyName: timesheet?.company?.name ?? '',
        weekStartDate: moment(timesheet.weekStartDate).format('MMM DD,YYYY'),
        weekEndDate: moment(timesheet.weekEndDate).format('MMM DD,YYYY'),
        user: names.join(' '),
        manager: timesheet.user?.manager?.firstName,
      },
    });

    if (timesheet?.user?.manager?.email) {
      const obj: IEmailBasicArgs = {
        to: timesheet?.user.manager.email ?? '',
        from: `${timesheet?.company?.name} ${emailSetting.fromEmail}`,
        subject: emailSetting.approveTimesheetReminder.subject,
        html: timesheetHtml,
      };

      if (hasLogo) {
        const image = await axios.get(timesheet?.company?.logo?.url as string, {
          responseType: 'arraybuffer',
        });
        const raw = Buffer.from(image.data).toString('base64');

        obj.attachments = [
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
      if (timesheet?.user?.status === UserStatus.Active && !timesheet?.user?.archived) {
        emailService
          .sendEmail(obj)
          .then((response) => {
            logger.info({
              operation,
              message: `Email response for ${timesheet?.user?.manager?.email}`,
              data: response,
            });
          })
          .catch((err) => {
            logger.error({
              operation,
              message: 'Error sending workschedule added email',
              data: err,
            });
          });
      }
    }
  } catch (err) {
    logger.error({
      operation,
      message: 'Error on creating workschedule detail',
      data: {
        timesheet,
        err,
      },
    });
  }
});

export default timesheetEmitter;
