import moment from 'moment';
import { inject, injectable } from 'inversify';

import { TYPES } from '../types';
import strings from '../config/strings';
import Paging from '../utils/paging';
import Timesheet from '../entities/timesheet.entity';
import * as apiError from '../utils/api-error';

import {
  ITimesheetCreateInput,
  ITimesheetRepository,
  ITimesheetService,
  ITimesheetUpdateInput,
  ITimesheetApproveRejectInput,
} from '../interfaces/timesheet.interface';
import { IEntityRemove, IErrorService, ILogger } from '../interfaces/common.interface';
import { IPaginationData, IPagingArgs } from '../interfaces/paging.interface';
import { ITimeEntryRepository } from '../interfaces/time-entry.interface';

@injectable()
export default class TimesheetService implements ITimesheetService {
  private name = 'TimesheetService';
  private timesheetRepository: ITimesheetRepository;
  private logger: ILogger;
  private errorService: IErrorService;
  private timeEntryRepository: ITimeEntryRepository;

  constructor(
    @inject(TYPES.TimesheetRepository) timesheetRepository: ITimesheetRepository,
    @inject(TYPES.LoggerFactory) loggerFactory: (name: string) => ILogger,
    @inject(TYPES.ErrorService) errorService: IErrorService,
    @inject(TYPES.TimeEntryRepository) _timeEntryRepository: ITimeEntryRepository
  ) {
    this.timesheetRepository = timesheetRepository;
    this.logger = loggerFactory(this.name);
    this.errorService = errorService;
    this.timeEntryRepository = _timeEntryRepository;
  }

  getAllAndCount = async (args: IPagingArgs): Promise<IPaginationData<Timesheet>> => {
    try {
      const { rows, count } = await this.timesheetRepository.getAllAndCount(args);

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

  update = async (args: ITimesheetUpdateInput): Promise<Timesheet> => {
    try {
      const id = args.id;
      const status = args.status;
      const lastApprovedAt = args.lastApprovedAt;
      const isSubmitted = args.isSubmitted;
      const lastSubmittedAt = args.lastSubmittedAt;
      const approver_id = args.approver_id;

      const timesheet = await this.timesheetRepository.update({
        id,
        status,
        lastApprovedAt,
        isSubmitted,
        lastSubmittedAt,
        approver_id,
      });

      return timesheet;
    } catch (err) {
      throw err;
    }
  };
}
