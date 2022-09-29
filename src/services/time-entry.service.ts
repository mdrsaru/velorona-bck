import moment from 'moment';
import { inject, injectable } from 'inversify';

import { TYPES } from '../types';
import Paging from '../utils/paging';
import * as apiError from '../utils/api-error';
import TimeEntry from '../entities/time-entry.entity';
import Timesheet from '../entities/timesheet.entity';
import { TimesheetStatus, events, TimeEntryApprovalStatus, EntryType } from '../config/constants';
import timesheetEmitter from '../subscribers/timesheet.subscriber';
import workscheduleEmitter from '../subscribers/workschedule.subscriber';

import { IEntityRemove, IErrorService, ILogger, Maybe } from '../interfaces/common.interface';
import { IPagingArgs } from '../interfaces/paging.interface';
import {
  ITimeEntryBulkRemoveInput,
  ITimeEntryCreateInput,
  ITimeEntryPaginationData,
  ITimeEntryRepository,
  ITimeEntryService,
  ITimeEntryStopInput,
  ITimeEntryUpdateInput,
  ITimeEntryWeeklyDetailsInput,
  ITimeEntriesApproveRejectInput,
  ITimeEntryBulkUpdateInput,
} from '../interfaces/time-entry.interface';
import { IUserPayRateRepository } from '../interfaces/user-payrate.interface';
import { ITimesheetRepository } from '../interfaces/timesheet.interface';
import { IProjectRepository } from '../interfaces/project.interface';
import { timeEntryEmitter } from '../subscribers/emitters';
import Project from '../entities/project.entity';
import { IBreakTimeRepository } from '../interfaces/break-time.interface';

@injectable()
export default class TimeEntryService implements ITimeEntryService {
  private name = 'TimeEntryService';
  private timeEntryRepository: ITimeEntryRepository;
  private userPayRateRepository: IUserPayRateRepository;
  private timesheetRepository: ITimesheetRepository;
  private projectRepository: IProjectRepository;
  private breakTimeRepository: IBreakTimeRepository;
  private logger: ILogger;
  private errorService: IErrorService;

  constructor(
    @inject(TYPES.TimeEntryRepository) timeEntryRepository: ITimeEntryRepository,
    @inject(TYPES.UserPayRateRepository) userPayRateRepository: IUserPayRateRepository,
    @inject(TYPES.LoggerFactory) loggerFactory: (name: string) => ILogger,
    @inject(TYPES.ErrorService) errorService: IErrorService,
    @inject(TYPES.TimesheetRepository) _timesheetRepository: ITimesheetRepository,
    @inject(TYPES.ProjectRepository) _projectRepository: IProjectRepository,
    @inject(TYPES.BreakTimeRepository) _breakTimeRepository: IBreakTimeRepository
  ) {
    this.timeEntryRepository = timeEntryRepository;
    this.userPayRateRepository = userPayRateRepository;
    this.logger = loggerFactory(this.name);
    this.errorService = errorService;
    this.timesheetRepository = _timesheetRepository;
    this.projectRepository = _projectRepository;
    this.breakTimeRepository = _breakTimeRepository;
  }

  getAllAndCount = async (args: IPagingArgs): Promise<ITimeEntryPaginationData> => {
    try {
      const { rows, count } = await this.timeEntryRepository.getAllAndCount(args);

      const activeEntry = await this.timeEntryRepository.getActiveEntry({
        company_id: args?.query?.company_id ?? undefined,
        created_by: args?.query?.created_by ?? undefined,
      });

      const activeBreakEntry = await this.breakTimeRepository.getActiveBreak({
        time_entry_id: activeEntry?.id as string,
      });
      const paging = Paging.getPagingResult({
        ...args,
        total: count,
      });

      return {
        paging,
        data: rows,
        activeEntry,
        activeBreakEntry,
      };
    } catch (err) {
      throw err;
    }
  };

  getWeeklyDetails = async (args: ITimeEntryWeeklyDetailsInput): Promise<TimeEntry[]> => {
    try {
      const timesheet_id = args.timesheet_id;
      const startTime = args.startTime;
      const endTime = args.endTime;
      const company_id = args.company_id;
      const created_by = args.created_by;
      const client_id = args.client_id;

      let startDate = moment().startOf('isoWeek').toDate();
      let endDate = moment().endOf('isoWeek').toDate();

      if (startTime && endTime) {
        startDate = moment(startTime).toDate();
        endDate = moment(endTime).toDate();
      }

      const timeEntry = await this.timeEntryRepository.getWeeklyDetails({
        timesheet_id,
        company_id,
        created_by,
        startTime: startDate,
        endTime: endDate,
        client_id,
      });

      return timeEntry;
    } catch (err) {
      throw err;
    }
  };

  create = async (args: ITimeEntryCreateInput) => {
    const operation = 'create';
    const startTime = args.startTime;
    const endTime = args.endTime;
    const clientLocation = args.clientLocation;
    const project_id = args.project_id;
    const company_id = args.company_id;
    const created_by = args.created_by;
    const entryType = args.entryType;
    const description = args.description;

    const project: any = await this.projectRepository.getById({ id: project_id });
    const weekStartDate = moment(startTime).startOf('isoWeek');
    const weekEndDate = moment(startTime).endOf('isoWeek');

    let foundTimesheet = await this.timesheetRepository.getSingleEntity({
      query: {
        weekStartDate,
        weekEndDate,
        user_id: created_by,
        client_id: project?.client_id,
        company_id: company_id,
      },
      select: ['isSubmitted'],
    });

    if (foundTimesheet?.isSubmitted) {
      throw new apiError.ConflictError({
        details: ['Timesheet has been submitted.Please contact your manager to unlock it.'],
      });
    }

    try {
      let timeEntry = await this.timeEntryRepository.create({
        startTime,
        endTime,
        clientLocation,
        project_id,
        company_id,
        created_by,
        entryType,
        description,
      });

      /* Create/Update timesheet if the end time is provided */
      try {
        if (endTime) {
          const project = await this.projectRepository.getById({
            id: project_id,
          });

          if (project) {
            let timesheet = await this.createUpdateTimesheet({
              startTime,
              client_id: project.client_id,
              company_id,
              user_id: created_by,
            });

            // Update the time entry with the updated timesheet id
            if (!timeEntry?.timesheet_id || timesheet.id !== timeEntry?.timesheet_id) {
              timeEntry = await this.timeEntryRepository.update({
                id: timeEntry.id,
                timesheet_id: timesheet.id,
              });
            }
          }
        }

        if (timeEntry?.entryType === EntryType.CICO) {
          const project = await this.projectRepository.getById({
            id: project_id,
          });

          timeEntryEmitter.emit(events.onCheckIn, {
            created_by: timeEntry.created_by,
            company_id: timeEntry.company_id,
            startTime: timeEntry.startTime,
            project: project?.name,
          });
        }
      } catch (err) {
        this.logger.error({
          operation,
          message: 'Error on creating/updating timesheet',
          data: err,
        });
      }

      return timeEntry;
    } catch (err) {
      this.errorService.throwError({
        err,
        operation,
        name: this.name,
        logError: true,
      });
    }
  };

  update = async (args: ITimeEntryUpdateInput) => {
    const operation = 'update';
    const id = args?.id;
    const startTime = args.startTime;
    const endTime = args.endTime;
    const clientLocation = args.clientLocation;
    const approver_id = args.approver_id;
    const project_id = args.project_id;
    const company_id = args.company_id;
    const created_by = args.created_by;
    const description = args.description;
    const breakTime = args.breakTime;
    const startBreakTime = args.startBreakTime;
    const endBreakTime = args.endBreakTime;
    try {
      let timeEntry = await this.timeEntryRepository.update({
        id,
        startTime,
        endTime,
        clientLocation,
        approver_id,
        project_id,
        company_id,
        created_by,
        description,
        breakTime,
        startBreakTime,
        endBreakTime,
      });
      try {
        /* Create/Update timesheet if the start/end time is provided */
        if (startTime || endTime) {
          const project = await this.projectRepository.getById({
            id: timeEntry.project_id,
          });

          if (project) {
            const timesheet = await this.createUpdateTimesheet({
              startTime: startTime ?? timeEntry.startTime,
              client_id: project.client_id,
              company_id: timeEntry.company_id,
              user_id: timeEntry.created_by,
            });

            // Update the time entry with the updated timesheet id
            if (!timeEntry?.timesheet_id || timesheet.id !== timeEntry?.timesheet_id) {
              timeEntry = await this.timeEntryRepository.update({
                id: timeEntry.id,
                timesheet_id: timesheet.id,
              });
            }
          }
        }
      } catch (err) {
        this.logger.error({
          operation,
          message: 'Error on creating/updating timesheet',
          data: err,
        });
      }

      if (endTime) {
        // Emit event for onTimeEntryStop
        if (timeEntry.entryType === EntryType.Timesheet) {
          timeEntryEmitter.emit(events.onTimeEntryStop, {
            created_by: timeEntry.created_by,
            duration: timeEntry.duration,
            company_id: timeEntry.company_id,
          });
        } else {
          timeEntryEmitter.emit(events.onCheckOut, {
            created_by: timeEntry.created_by,
            company_id: timeEntry.company_id,
            endTime: timeEntry.endTime,
            duration: timeEntry.duration,
          });
        }
      }
      return timeEntry;
    } catch (err) {
      this.errorService.throwError({
        err,
        operation,
        name: this.name,
        logError: true,
      });
    }
  };

  remove = async (args: IEntityRemove) => {
    try {
      const id = args.id;

      const timeEntry = await this.timeEntryRepository.remove({
        id,
      });

      const project = await this.projectRepository.getById({
        id: timeEntry.project_id,
      });

      if (project) {
        await this.createUpdateTimesheet({
          startTime: timeEntry.startTime,
          client_id: project.client_id,
          company_id: timeEntry.company_id,
          user_id: timeEntry.created_by,
        });
      }
      return timeEntry;
    } catch (err) {
      throw err;
    }
  };

  bulkRemove = async (args: ITimeEntryBulkRemoveInput) => {
    try {
      const ids = args.ids;
      const created_by = args.created_by;
      const company_id = args.company_id;
      const client_id = args.client_id;

      const timeEntries = await this.timeEntryRepository.bulkRemove({
        ids,
        created_by,
        company_id,
        client_id,
      });

      let startDateObj: any = {};
      timeEntries.forEach((timeEntry) => {
        const startDate = moment(timeEntry.startTime).startOf('isoWeek').format('YYYY-MM-DD');
        startDateObj[startDate] = true;
      });
      try {
        Object.keys(startDateObj).forEach(async (date) => {
          await this.createUpdateTimesheet({
            startTime: new Date(date),
            client_id: client_id,
            company_id: company_id,
            user_id: created_by,
          });
        });
      } catch (err) {
        this.logger.error({
          operation: 'updateTimesheet',
          message: 'Error updating timesheet while bulk delete',
          data: err,
        });
      }
      return timeEntries;
    } catch (err) {
      throw err;
    }
  };

  /**
   * Timesheet(Weekly) will be auto generated for the provided time entry related to the specified start time
   * Will be created/updated taking the iso start week referencing the time entry start time
   */
  createUpdateTimesheet = async (args: CreateUpdateTimesheet) => {
    try {
      const startTime = args.startTime;
      const company_id = args.company_id;
      const user_id = args.user_id;
      const client_id = args.client_id;
      const approver_id = args.approver_id;

      const startDate = moment(startTime).startOf('isoWeek');
      const endDate = moment(startTime).endOf('isoWeek');

      const totalTimeInSeconds = await this.timeEntryRepository.getTotalTimeInSeconds({
        company_id,
        user_id,
        client_id,
        startTime: startDate.format('YYYY-MM-DDTHH:mm:ss'),
        endTime: endDate.format('YYYY-MM-DDTHH:mm:ss'),
      });
      const totalTimeInHours = totalTimeInSeconds / 3600;

      //const totalExpense = await this.timeEntryRepository.getUserTotalExpense({
      //company_id,
      //user_id,
      //client_id,
      //startTime: startDate.format('YYYY-MM-DDTHH:mm:ss'),
      //endTime: endDate.format('YYYY-MM-DDTHH:mm:ss'),
      //});

      const weekStartDate = startDate.format('YYYY-MM-DD');
      const weekEndDate = endDate.format('YYYY-MM-DD');

      const found = await this.timesheetRepository.getAll({
        query: {
          user_id,
          client_id,
          weekStartDate,
          weekEndDate,
        },
        select: ['id'],
      });

      let id: Maybe<string>;

      if (found.length > 1) {
        // throw since the timesheet should be unique for the provided week for same user, client and start/end date.
        throw new apiError.ConflictError({
          details: ['More than 1 timesheet exists'],
        });
      } else if (found.length === 1) {
        id = found[0].id;
      }

      let timesheet: Timesheet;
      if (id) {
        timesheet = await this.timesheetRepository.update({
          id,
          duration: totalTimeInSeconds,
        });
      } else {
        timesheet = await this.timesheetRepository.create({
          weekStartDate,
          weekEndDate,
          duration: totalTimeInSeconds,
          status: TimesheetStatus.Pending,
          user_id,
          client_id,
          company_id,
        });

        timesheetEmitter.emit(events.onTimesheetCreate, {
          timesheet_id: timesheet.id,
          client_id,
          weekStartDate,
        });
      }

      workscheduleEmitter.emit(events.updateWorkscheduleUsage, {
        startDate: weekStartDate,
        endDate: weekEndDate,
        company_id,
      });

      return timesheet;
    } catch (err) {
      throw err;
    }
  };

  approveRejectTimeEntries = async (args: ITimeEntriesApproveRejectInput): Promise<boolean> => {
    try {
      const ids = args.ids;
      const approver_id = args.approver_id;
      const approvalStatus = args.approvalStatus;
      const timesheet_id = args.timesheet_id;

      const result = await this.timeEntryRepository.approveRejectTimeEntries({
        ids,
        approver_id,
        approvalStatus,
        timesheet_id,
      });

      if (timesheet_id) {
        timesheetEmitter.emit(events.onTimeEntriesApprove, {
          timesheet_id,
          approver_id,
          lastApprovedAt: new Date(),
        });
      }

      return result;
    } catch (err) {
      throw err;
    }
  };

  bulkUpdate = async (args: ITimeEntryBulkUpdateInput): Promise<boolean> => {
    try {
      const date = args.date;
      const timesheet_id = args.timesheet_id;
      const duration = args.duration;
      const project_id = args.project_id;

      const updated = await this.timeEntryRepository.bulkUpdate({
        date,
        timesheet_id,
        duration,
        project_id,
      });

      const timesheet = await this.timesheetRepository.getById({
        id: timesheet_id,
        select: ['company_id', 'id', 'weekStartDate', 'weekEndDate'],
      });

      if (timesheet) {
        workscheduleEmitter.emit(events.updateWorkscheduleUsage, {
          startDate: timesheet.weekStartDate,
          endDate: timesheet.weekEndDate,
          company_id: timesheet.company_id,
        });
      }

      return updated;
    } catch (err) {
      throw err;
    }
  };
}

type CreateUpdateTimesheet = {
  /**
   * Start datetime of the time-entry
   */
  startTime: Date;
  company_id: string;
  user_id: string;
  client_id: string;
  approver_id?: string;
};
