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
import { IUserPayRateRepository } from '../interfaces/user-payrate.interface';

@injectable()
export default class TimeEntryService implements ITimeEntryService {
  private name = 'TimeEntryService';
  private timeEntryRepository: ITimeEntryRepository;
  private userPayRateRepository: IUserPayRateRepository;
  private logger: ILogger;
  private errorService: IErrorService;

  constructor(
    @inject(TYPES.TimeEntryRepository) timeEntryRepository: ITimeEntryRepository,
    @inject(TYPES.UserPayRateRepository) userPayRateRepository: IUserPayRateRepository,
    @inject(TYPES.LoggerFactory) loggerFactory: (name: string) => ILogger,
    @inject(TYPES.ErrorService) errorService: IErrorService
  ) {
    this.timeEntryRepository = timeEntryRepository;
    this.userPayRateRepository = userPayRateRepository;
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
      let timeEntry = await this.timeEntryRepository.create({
        startTime,
        endTime,
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
