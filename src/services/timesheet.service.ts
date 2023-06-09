import moment from 'moment';
import { inject, injectable } from 'inversify';
import set from 'lodash/set';

import { checkRoles } from '../utils/roles';
import { TYPES } from '../types';
import strings from '../config/strings';
import Paging from '../utils/paging';
import Timesheet from '../entities/timesheet.entity';
import * as apiError from '../utils/api-error';
import { EntryType, Role, UserClientStatus, InvoiceSchedule, events, TimesheetStatus } from '../config/constants';

import {
  ITimesheetCreateInput,
  ITimesheetRepository,
  ITimesheetService,
  ITimesheetUpdateInput,
  ITimesheetApproveRejectInput,
  ITimesheetBulkCreateInput,
  ITimesheetReminderInput,
  IUserTimesheetCreateInput,
} from '../interfaces/timesheet.interface';
import { IEntityRemove, IErrorService, ILogger } from '../interfaces/common.interface';
import { IPaginationData, IPagingArgs } from '../interfaces/paging.interface';
import { ITimeEntryRepository } from '../interfaces/time-entry.interface';
import { IAttachedTimesheetRepository } from '../interfaces/attached-timesheet.interface';
import { NotFoundError } from '../utils/api-error';
import { IUserRepository } from '../interfaces/user.interface';
import { IUserClientRepository } from '../interfaces/user-client.interface';
import { IClientRepository } from '../interfaces/client.interface';
import timeEntryEmitter from '../subscribers/timeEntry.subscriber';
import timesheetEmitter from '../subscribers/timesheet.subscriber';
import { IProjectRepository } from '../interfaces/project.interface';

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
  private clientRepository: IClientRepository;
  private projectRepository: IProjectRepository;

  constructor(
    @inject(TYPES.TimesheetRepository) timesheetRepository: ITimesheetRepository,
    @inject(TYPES.LoggerFactory) loggerFactory: (name: string) => ILogger,
    @inject(TYPES.ErrorService) errorService: IErrorService,
    @inject(TYPES.TimeEntryRepository) _timeEntryRepository: ITimeEntryRepository,
    @inject(TYPES.AttachedTimesheetRepository) _attachedTimesheet: IAttachedTimesheetRepository,
    @inject(TYPES.UserRepository) _userRepository: IUserRepository,
    @inject(TYPES.UserClientRepository) _userClientRepository: IUserClientRepository,
    @inject(TYPES.ClientRepository) _clientRepository: IClientRepository,
    @inject(TYPES.ProjectRepository) _projectRepository: IProjectRepository
  ) {
    this.timesheetRepository = timesheetRepository;
    this.logger = loggerFactory(this.name);
    this.errorService = errorService;
    this.timeEntryRepository = _timeEntryRepository;
    this.attachedTimesheetRepository = _attachedTimesheet;
    this.userRepository = _userRepository;
    this.userClientRepository = _userClientRepository;
    this.clientRepository = _clientRepository;
    this.projectRepository = _projectRepository;
  }

  getAllAndCount = async (args: IPagingArgs): Promise<IPaginationData<Timesheet>> => {
    try {
      const client_id = args.query?.client_id;
      let period = InvoiceSchedule.Weekly;

      /**
       * Used for showing grouped timesheet according to client invoice schedule if the role is either one of the following:
       * TaskManager, CompanyAdmin, SuperAdmin
       */
      let showGroupedTimesheet = false;
      if ('roles' in args?.query && args?.query?.needGroupedTimesheet) {
        const roles = args.query.roles;

        showGroupedTimesheet = checkRoles({
          userRoles: roles,
          expectedRoles: [Role.CompanyAdmin, Role.SuperAdmin, Role.TaskManager],
        });
      }

      delete args?.query?.roles;
      delete args?.query?.needGroupedTimesheet;

      if ('ids' in args.query) {
        args.query.id = args.query.ids;
        delete args.query.ids;
      }

      let _rows: Timesheet[];
      let _count: number;

      if (showGroupedTimesheet) {
        const { rows, count } = await this.timesheetRepository.getByFortnightOrMonthOrCustom(args);
        _rows = rows;
        _count = count;
      } else {
        const { rows, count } = await this.timesheetRepository.getAllAndCount(args);
        _rows = rows;
        _count = count;
      }

      const paging = Paging.getPagingResult({
        ...args,
        total: _count,
      });

      return {
        paging,
        data: _rows,
      };
    } catch (err) {
      throw err;
    }
  };

  bulkCreate = async (args: ITimesheetBulkCreateInput): Promise<string> => {
    try {
      let query: any;
      query = {
        role: Role.Employee,
        entryType: EntryType.Timesheet,
      };
      if (args.user_id) {
        query.id = args.user_id;
      }
      let { rows } = await this.userRepository.getAllAndCount({
        query: query,
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

  bulkUserTimesheetCreate = async (args: IUserTimesheetCreateInput): Promise<string> => {
    try {
      let date = args.date;
      let client_id = args.client_id;
      let user = args.user;
      let weekStartDate = moment(date).startOf('isoWeek');
      const weekEndDate = moment(date).endOf('isoWeek');
      let users: any = [];

      users.push({
        weekStartDate: weekStartDate,
        weekEndDate: weekEndDate,
        user_id: user?.id,
        company_id: user?.company_id,
        client_id: client_id,
      });

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
      let status = args.status;
      const lastApprovedAt = args.lastApprovedAt;
      const isSubmitted = args.isSubmitted;
      const lastSubmittedAt = args.lastSubmittedAt;
      const approver_id = args.approver_id;

      let found: any = await this.timesheetRepository.getById({ id, relations: ['user'] });

      if (found.user.timesheet_attachment && isSubmitted) {
        let attachedTimesheet = await this.attachedTimesheetRepository.getAll({ created_by: found.user.id });

        if (!attachedTimesheet.length)
          throw new NotFoundError({
            details: [strings.timesheetMandatory],
          });
      }

      if (isSubmitted) {
        status = TimesheetStatus.Submitted;
      }

      if (!isSubmitted) {
        status = TimesheetStatus.Open;
      }
      const timesheet = await this.timesheetRepository.update({
        id,
        status,
        lastApprovedAt,
        isSubmitted,
        lastSubmittedAt,
        approver_id,
      });

      if (!isSubmitted) {
        // Emit onTimesheetUnlock event
        timeEntryEmitter.emit(events.onTimesheetUnlock, {
          timesheet_id: id,
        });
      }

      if (isSubmitted) {
        // Emit sendTimesheetSubmitEmail event
        timesheetEmitter.emit(events.sendTimesheetSubmitEmail, {
          timesheet_id: id,
        });
      }
      return timesheet;
    } catch (err) {
      throw err;
    }
  };

  submitReminder = async (args: ITimesheetReminderInput): Promise<void> => {
    try {
      const date = args.date;

      const timesheets = await this.timesheetRepository.getAll({ relations: ['company', 'user', 'company.logo'] });

      timesheets.map(async (timesheet) => {
        if (!timesheet.isSubmitted) {
          const timeEntry = await this.timeEntryRepository.getAll({
            query: {
              timesheet_id: timesheet.id,
            },
            select: ['timesheet_id', 'created_by', 'project_id'],
          });

          const userProject = await this.projectRepository.getUsersAssignedProject({
            user_id: timeEntry?.[0]?.created_by,
            project_id: timeEntry?.[0]?.project_id,
          });
          if (userProject?.length) {
            if (date > timesheet.weekEndDate) {
              // Emit sendTimesheetSubmitReminderEmail event
              timesheetEmitter.emit(events.onTimesheetSubmitReminder, {
                timesheet,
              });
            }
          }
        }
      });
    } catch (err) {
      throw err;
    }
  };

  approveReminder = async (args: ITimesheetReminderInput): Promise<void> => {
    try {
      const date = args.date;

      const timesheets = await this.timesheetRepository.getAll({
        relations: ['company', 'user', 'company.logo', 'user.manager'],
      });

      timesheets.map(async (timesheet) => {
        if (timesheet.status === TimesheetStatus.Submitted && timesheet.isSubmitted) {
          const timeEntry = await this.timeEntryRepository.getAll({
            query: {
              timesheet_id: timesheet.id,
            },
            select: ['timesheet_id', 'created_by', 'project_id'],
          });

          const userProject = await this.projectRepository.getUsersAssignedProject({
            user_id: timeEntry?.[0]?.created_by,
            project_id: timeEntry?.[0]?.project_id,
          });

          if (userProject?.length) {
            if (date > timesheet.weekEndDate) {
              //Emit sendTimesheetApproveReminderEmail event
              timesheetEmitter.emit(events.onTimesheetApproveReminder, {
                timesheet,
              });
            }
          }
        }
      });
    } catch (err) {
      throw err;
    }
  };
}
