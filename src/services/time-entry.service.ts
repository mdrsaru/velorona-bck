import moment from 'moment';
import { inject, injectable } from 'inversify';

import { TYPES } from '../types';
import Paging from '../utils/paging';
import TimeEntry from '../entities/time-entry.entity';

import { IEntityRemove, IErrorService, ILogger } from '../interfaces/common.interface';
import { IPaginationData, IPagingArgs } from '../interfaces/paging.interface';
import {
  ITimeEntryCreateInput,
  ITimeEntryRepository,
  ITimeEntryService,
  ITimeEntryStopInput,
  ITimeEntryUpdateInput,
  ITimeEntryWeeklyDetailsInput,
} from '../interfaces/time-entry.interface';

@injectable()
export default class TimeEntryService implements ITimeEntryService {
  private name = 'TimeEntryService';
  private timeEntryRepository: ITimeEntryRepository;
  private logger: ILogger;
  private errorService: IErrorService;

  constructor(
    @inject(TYPES.TimeEntryRepository) timeEntryRepository: ITimeEntryRepository,
    @inject(TYPES.LoggerFactory) loggerFactory: (name: string) => ILogger,
    @inject(TYPES.ErrorService) errorService: IErrorService
  ) {
    this.timeEntryRepository = timeEntryRepository;
    this.logger = loggerFactory(this.name);
    this.errorService = errorService;
  }

  getAllAndCount = async (args: IPagingArgs): Promise<IPaginationData<TimeEntry>> => {
    try {
      const { rows, count } = await this.timeEntryRepository.getAllAndCount(args);

      const paging = Paging.getPagingResult({
        ...args,
        total: count,
      });

      return {
        paging,
        data: rows,
      };
    } catch (err) {
      throw err;
    }
  };

  getWeeklyDetails = async (args: ITimeEntryWeeklyDetailsInput): Promise<TimeEntry[]> => {
    try {
      const start = args.start;
      const end = args.end;
      const company_id = args.company_id;
      const created_by = args.created_by;

      let startDate = moment().startOf('isoWeek').toDate();
      let endDate = moment().endOf('isoWeek').toDate();

      if (start && end) {
        startDate = moment(start).toDate();
        endDate = moment(end).toDate();
      }

      const timeEntry = await this.timeEntryRepository.getWeeklyDetails({
        company_id,
        created_by,
        start: startDate,
        end: endDate,
      });

      return timeEntry;
    } catch (err) {
      throw err;
    }
  };

  create = async (args: ITimeEntryCreateInput) => {
    const operation = 'create';
    const start = args.start;
    const end = args.end;
    const clientLocation = args.clientLocation;
    const project_id = args.project_id;
    const company_id = args.company_id;
    const created_by = args.created_by;
    const task_id = args.task_id;

    try {
      let timeEntry = await this.timeEntryRepository.create({
        start,
        end,
        clientLocation,
        project_id,
        company_id,
        created_by,
        task_id,
      });

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
    const start = args.start;
    const end = args.end;
    const clientLocation = args.clientLocation;
    const approver_id = args.approver_id;
    const project_id = args.project_id;
    const company_id = args.company_id;
    const created_by = args.created_by;
    const task_id = args.task_id;

    try {
      let timeEntry = await this.timeEntryRepository.update({
        id,
        start,
        end,
        clientLocation,
        approver_id,
        project_id,
        company_id,
        created_by,
        task_id,
      });

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
      const end = args.end;

      let timeEntry = await this.timeEntryRepository.update({
        id,
        end,
      });

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
}
