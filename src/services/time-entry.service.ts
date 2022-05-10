import moment from 'moment';
import { inject, injectable } from 'inversify';

import { TYPES } from '../types';
import Paging from '../utils/paging';
import * as apiError from '../utils/api-error';
import TimeEntry from '../entities/time-entry.entity';
import { TimesheetStatus } from '../config/constants';

import { IEntityRemove, IErrorService, ILogger, Maybe } from '../interfaces/common.interface';
import { IPaginationData, IPagingArgs } from '../interfaces/paging.interface';
import {
  ITimeEntryCreateInput,
  ITimeEntryRepository,
  ITimeEntryService,
  ITimeEntryStopInput,
  ITimeEntryUpdateInput,
  ITimeEntryWeeklyDetailsInput,
} from '../interfaces/time-entry.interface';
import { IUserPayRateRepository } from '../interfaces/user-payrate.interface';
import { ITimesheetRepository } from '../interfaces/timesheet.interface';
import { IProjectRepository } from '../interfaces/project.interface';

@injectable()
export default class TimeEntryService implements ITimeEntryService {
  private name = 'TimeEntryService';
  private timeEntryRepository: ITimeEntryRepository;
  private userPayRateRepository: IUserPayRateRepository;
  private timesheetRepository: ITimesheetRepository;
  private projectRepository: IProjectRepository;
  private logger: ILogger;
  private errorService: IErrorService;

  constructor(
    @inject(TYPES.TimeEntryRepository) timeEntryRepository: ITimeEntryRepository,
    @inject(TYPES.UserPayRateRepository) userPayRateRepository: IUserPayRateRepository,
    @inject(TYPES.LoggerFactory) loggerFactory: (name: string) => ILogger,
    @inject(TYPES.ErrorService) errorService: IErrorService,
    @inject(TYPES.TimesheetRepository) _timesheetRepository: ITimesheetRepository,
    @inject(TYPES.ProjectRepository) _projectRepository: IProjectRepository
  ) {
    this.timeEntryRepository = timeEntryRepository;
    this.userPayRateRepository = userPayRateRepository;
    this.logger = loggerFactory(this.name);
    this.errorService = errorService;
    this.timesheetRepository = _timesheetRepository;
    this.projectRepository = _projectRepository;
  }

  getAllAndCount = async (args: IPagingArgs): Promise<IPaginationData<TimeEntry>> => {
    try {
      const { rows, count } = await this.timeEntryRepository.getAllAndCount(args);
      let activeEntry = await this.timeEntryRepository.getActiveEntry({});

      const paging = Paging.getPagingResult({
        ...args,
        total: count,
      });

      return {
        paging,
        data: rows,
        activeEntry,
      };
    } catch (err) {
      throw err;
    }
  };

  getWeeklyDetails = async (args: ITimeEntryWeeklyDetailsInput): Promise<TimeEntry[]> => {
    try {
      const startTime = args.startTime;
      const endTime = args.endTime;
      const company_id = args.company_id;
      const created_by = args.created_by;

      let startDate = moment().startOf('isoWeek').toDate();
      let endDate = moment().endOf('isoWeek').toDate();

      if (startTime && endTime) {
        startDate = moment(startTime).toDate();
        endDate = moment(endTime).toDate();
      }

      const timeEntry = await this.timeEntryRepository.getWeeklyDetails({
        company_id,
        created_by,
        startTime: startDate,
        endTime: endDate,
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
    const task_id = args.task_id;

    try {
      const timeEntry = await this.timeEntryRepository.create({
        startTime,
        endTime,
        clientLocation,
        project_id,
        company_id,
        created_by,
        task_id,
      });

      /* Create/Update timesheet if the end time is provided */
      try {
        if (endTime) {
          const project = await this.projectRepository.getById({
            id: project_id,
          });

          if (project) {
            await this.createUpdateTimesheet({
              startTime,
              client_id: project.client_id,
              company_id,
              user_id: created_by,
            });
          }
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
    const task_id = args.task_id;

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
        task_id,
      });

      /* Create/Update timesheet if the end time is provided */
      try {
        if (endTime) {
          const project = await this.projectRepository.getById({
            id: timeEntry.project_id,
          });

          if (project) {
            await this.createUpdateTimesheet({
              startTime: startTime ?? timeEntry.startTime,
              client_id: project.client_id,
              company_id: timeEntry.company_id,
              user_id: timeEntry.created_by,
            });
          }
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

  stop = async (args: ITimeEntryStopInput) => {
    const operation = 'stop';
    try {
      const id = args.id;
      const endTime = args.endTime;

      let timeEntry = await this.timeEntryRepository.update({
        id,
        endTime,
      });

      /* Create/Update timesheet if the end time is provided */
      try {
        if (endTime) {
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

  remove = async (args: IEntityRemove) => {
    try {
      const id = args.id;

      const timeEntry = await this.timeEntryRepository.remove({
        id,
      });

      return timeEntry;
    } catch (err) {
      throw err;
    }
  };

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
        startTime: startDate.format('YYYY-MM-DDTHH:mm:ss'),
        endTime: endDate.format('YYYY-MM-DDTHH:mm:ss'),
      });
      const totalTimeInHours = totalTimeInSeconds / 3600;

      const totalExpense = await this.timeEntryRepository.getUserTotalExpense({
        company_id,
        user_id,
        client_id,
        startTime: startDate.format('YYYY-MM-DDTHH:mm:ss'),
        endTime: endDate.format('YYYY-MM-DDTHH:mm:ss'),
      });

      const weekStartDate = startDate.format('YYYY-MM-DD');
      const weekEndDate = endDate.format('YYYY-MM-DD');

      const found = await this.timesheetRepository.getAll({
        query: {
          user_id,
          client_id,
          weekStartDate,
          weekEndDate,
        },
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

      if (id) {
        const timesheet = await this.timesheetRepository.update({
          id,
          duration: totalTimeInSeconds,
          totalExpense,
        });

        return timesheet;
      } else {
        console.log(
          totalTimeInHours,
          totalExpense,
          {
            weekStartDate,
            weekEndDate,
            duration: totalTimeInSeconds,
            totalExpense,
            status: TimesheetStatus.Unpaid,
            user_id,
            client_id,
            company_id,
          },
          'hello\n\n'
        );
        const timesheet = await this.timesheetRepository.create({
          weekStartDate,
          weekEndDate,
          duration: totalTimeInSeconds,
          totalExpense,
          status: TimesheetStatus.Unpaid,
          user_id,
          client_id,
          company_id,
        });

        return timesheet;
      }
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
