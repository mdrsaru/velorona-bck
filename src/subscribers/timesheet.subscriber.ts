import { timesheetEmitter } from './emitters';
import { TYPES } from '../types';
import { events, TimesheetStatus, TimeEntryApprovalStatus } from '../config/constants';
import container from '../inversify.config';

import { ILogger } from '../interfaces/common.interface';
import { ITimesheetRepository } from '../interfaces/timesheet.interface';
import { ITimeEntryRepository } from '../interfaces/time-entry.interface';

type TimesheetApprove = {
  timesheet_id: string;
  approver_id: string;
  lastApprovedAt: Date;
};

timesheetEmitter.on(events.onTimeEntriesApprove, async (args: TimesheetApprove) => {
  const operation = events.onTimeEntriesApprove;

  const timesheetRepository: ITimesheetRepository = container.get<ITimesheetRepository>(TYPES.TimesheetRepository);
  const timeEntryRepository: ITimeEntryRepository = container.get<ITimeEntryRepository>(TYPES.TimeEntryRepository);
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
