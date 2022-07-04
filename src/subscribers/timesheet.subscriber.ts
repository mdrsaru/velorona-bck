import { timesheetEmitter } from './emitters';
import { TYPES } from '../types';
import { events, TimesheetStatus, TimeEntryApprovalStatus } from '../config/constants';
import container from '../inversify.config';

import { ILogger } from '../interfaces/common.interface';
import { ITimesheetRepository } from '../interfaces/timesheet.interface';
import { ITimeEntryRepository } from '../interfaces/time-entry.interface';
import { IUserRepository } from '../interfaces/user.interface';
import { IActivityLogRepository } from '../interfaces/activity-log.interface';
import UserRepository from '../tests/mock/user.repository';
import moment from 'moment';

type TimesheetApprove = {
  timesheet_id: string;
  approver_id: string;
  lastApprovedAt: Date;
};

timesheetEmitter.on(events.onTimeEntriesApprove, async (args: TimesheetApprove) => {
  const operation = events.onTimeEntriesApprove;

  const timesheetRepository: ITimesheetRepository = container.get<ITimesheetRepository>(TYPES.TimesheetRepository);
  const timeEntryRepository: ITimeEntryRepository = container.get<ITimeEntryRepository>(TYPES.TimeEntryRepository);
  const userRepository: IUserRepository = container.get<IUserRepository>(TYPES.UserRepository);
  const activityLogRepository: IActivityLogRepository = container.get<IActivityLogRepository>(
    TYPES.ActivityLogRepository
  );
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

    const allTimeEntries = await timeEntryRepository.countEntities({
      query: {
        timesheet_id,
      },
    });
    let status: TimesheetStatus;

    if (approvedEntriesCount === allTimeEntries) {
      status = TimesheetStatus.Approved;
    } else if (approvedEntriesCount) {
      status = TimesheetStatus.PartiallyApproved;
    } else {
      status = TimesheetStatus.Pending;
    }

    await timesheetRepository.update({
      id: timesheet_id,
      status,
      approver_id,
      lastApprovedAt,
    });

    const timesheet = await timesheetRepository.getById({ id: timesheet_id });
    const approver = await userRepository.getById({ id: approver_id });
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

export default timesheetEmitter;
