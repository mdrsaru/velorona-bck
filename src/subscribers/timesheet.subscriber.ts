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
} from '../config/constants';
import container from '../inversify.config';

import { IEmailBasicArgs, IEmailService, ILogger, ITemplateService } from '../interfaces/common.interface';
import { ITimesheetRepository } from '../interfaces/timesheet.interface';
import { ITimeEntryRepository } from '../interfaces/time-entry.interface';
import { IUserRepository } from '../interfaces/user.interface';
import { IActivityLogRepository } from '../interfaces/activity-log.interface';
import { IClientRepository } from '../interfaces/client.interface';
import { IAttachedTimesheetRepository } from '../interfaces/attached-timesheet.interface';
import axios from 'axios';

type TimesheetApprove = {
  timesheet_id: string;
  approver_id: string;
  lastApprovedAt: Date;
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
      status = TimesheetStatus.Pending;
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
    console.log(timesheet, ' \n timesheet \n ');
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
    const timesheetHtml = handlebarsService.compile({
      template: emailTemplate,
      data: {
        week: `${timesheet.weekStartDate} - ${timesheet.weekEndDate}`,
        user: `${timesheet.user.firstName} ${timesheet.user.middleName && timesheet.user.middleName} ${
          timesheet.user.lastName
        } `,
        manager: timesheet.user?.manager?.firstName,
        hasLogo: hasLogo,
        status: status,
        companyName: timesheet?.company?.name ?? '',
      },
    });

    const obj: IEmailBasicArgs = {
      to: timesheet.user?.manager?.email as string,
      from: emailSetting.fromEmail,
      subject: emailSetting.submitTimesheet.subject,
      html: timesheetHtml,
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

    logger.info({
      operation,
      message: `Updated timesheet with the required status`,
      data: {
        timesheet_id,
      },
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

export default timesheetEmitter;
