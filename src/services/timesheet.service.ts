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
  ITimesheetBulkCreateInput,
} from '../interfaces/timesheet.interface';
import { IEntityRemove, IErrorService, ILogger } from '../interfaces/common.interface';
import { IPaginationData, IPagingArgs } from '../interfaces/paging.interface';
import { ITimeEntryRepository } from '../interfaces/time-entry.interface';
import { IAttachedTimesheetRepository } from '../interfaces/attached-timesheet.interface';
import { NotFoundError } from '../utils/api-error';
import { IUserRepository } from '../interfaces/user.interface';
import { IUserClientRepository } from '../interfaces/user-client.interface';
import { EntryType, Role, UserClientStatus } from '../config/constants';

@injectable()
export default class TimesheetService implements ITimesheetService {
  private name = 'TimesheetService';
  private timesheetRepository: ITimesheetRepository;
  private userRepository: IUserRepository;
  private userClientRepository: IUserClientRepository;
  private logger: ILogger;
  private errorService: IErrorService;
  private timeEntryRepository: ITimeEntryRepository;
  private attachedTimesheetRepository: IAttachedTimesheetRepository;

  constructor(
    @inject(TYPES.TimesheetRepository) timesheetRepository: ITimesheetRepository,
    @inject(TYPES.LoggerFactory) loggerFactory: (name: string) => ILogger,
    @inject(TYPES.ErrorService) errorService: IErrorService,
    @inject(TYPES.TimeEntryRepository) _timeEntryRepository: ITimeEntryRepository,
    @inject(TYPES.AttachedTimesheetRepository) _attachedTimesheet: IAttachedTimesheetRepository,
    @inject(TYPES.UserRepository) _userRepository: IUserRepository,
    @inject(TYPES.UserClientRepository) _userClientRepository: IUserClientRepository
  ) {
    this.timesheetRepository = timesheetRepository;
    this.logger = loggerFactory(this.name);
    this.errorService = errorService;
    this.timeEntryRepository = _timeEntryRepository;
    this.attachedTimesheetRepository = _attachedTimesheet;
    this.userRepository = _userRepository;
    this.userClientRepository = _userClientRepository;
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
  bulkCreate = async (args: ITimesheetBulkCreateInput): Promise<string> => {
    try {
      let { rows } = await this.userRepository.getAllAndCount({
        query: {
          role: Role.Employee,
          entryType: EntryType.Timesheet,
        },
      });

      let date = args.date;
      let weekStartDate = moment(date).startOf('isoWeek');
      const weekEndDate = moment(date).endOf('isoWeek');
      let users: any = [];

      for (let user of rows) {
        const clients = await this.userClientRepository.getAll({
          query: {
            user_id: user.id,
            status: UserClientStatus.Active,
          },
          select: ['client_id'],
        });

        if (!clients.length) {
          continue;
        } else {
          users.push({
            weekStartDate: weekStartDate,
            weekEndDate: weekEndDate,
            user_id: user.id,
            company_id: user.company_id,
            client_id: clients?.[0]?.client_id,
          });
        }
      }

      let result = await this.timesheetRepository.bulkCreate({
        query: users,
      });
      return result;
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

      let found: any = await this.timesheetRepository.getById({ id, relations: ['user'] });

      if (found.user.timesheet_attachment) {
        let attachedTimesheet = await this.attachedTimesheetRepository.getAll({ created_by: found.user.id });

        if (!attachedTimesheet.length)
          throw new NotFoundError({
            details: [strings.timesheetMandatory],
          });
      }
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
