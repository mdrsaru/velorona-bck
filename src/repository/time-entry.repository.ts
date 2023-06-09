import moment from 'moment';
import merge from 'lodash/merge';
import isNil from 'lodash/isNil';
import isDate from 'lodash/isDate';
import isString from 'lodash/isString';
import isArray from 'lodash/isArray';
import isEmpty from 'lodash/isEmpty';
import groupBy from 'lodash/groupBy';
import { inject, injectable } from 'inversify';
import { getRepository, LessThanOrEqual, MoreThanOrEqual, In, IsNull, Not, getManager, EntityManager } from 'typeorm';

import { TYPES } from '../types';
import strings from '../config/strings';
import { CompanyRole, entities, TimeEntryApprovalStatus } from '../config/constants';
import { timeEntry, userPayRate, projects, timesheet } from '../config/db/columns';
import * as apiError from '../utils/api-error';
import TimeEntry from '../entities/time-entry.entity';
import Timesheet from '../entities/timesheet.entity';
import { NotFoundError } from '../utils/api-error';
import BaseRepository from './base.repository';

import { Maybe } from '../interfaces/common.interface';
import { ICompanyRepository } from '../interfaces/company.interface';
import { IProjectRepository } from '../interfaces/project.interface';
import { IUserPayRateRepository } from '../interfaces/user-payrate.interface';
import { ITimesheetRepository } from '../interfaces/timesheet.interface';
import {
  ITimeEntryCreateInput,
  ITimeEntryRepository,
  ITimeEntryTotalDurationInput,
  ITimeEntryUpdateInput,
  ITimeEntryWeeklyDetailsRepoInput,
  IUserTotalExpenseInput,
  ITimeEntryActiveInput,
  IProjectItemInput,
  IProjectItem,
  IDurationMap,
  ITimeEntryBulkRemoveInput,
  ITimeEntriesApproveRejectInput,
  IMarkApprovedTimeEntriesWithInvoice,
  ITimeEntryHourlyRateInput,
  ITotalDurationInput,
  ITimeEntryUnlockInput,
  ITimeEntryBulkUpdateInput,
  IMarkPeriodicApprovedTimeEntriesWithInvoice,
  IPeriodicTimeEntriesInput,
  IExpenseAndInvoicedDuration,
  ITimeEntryBulkUpdateResult,
} from '../interfaces/time-entry.interface';
import { IUserRepository } from '../interfaces/user.interface';
import { IGetOptions, IGetAllAndCountResult } from '../interfaces/paging.interface';
import user from '../config/inversify/user';
import { IBreakTimeRepository } from '../interfaces/break-time.interface';

type DurationMap = {
  [statusOrInvoiceId: string]: {
    [date: string]: number;
  };
};

@injectable()
export default class TimeEntryRepository extends BaseRepository<TimeEntry> implements ITimeEntryRepository {
  private userRepository: IUserRepository;
  private companyRepository: ICompanyRepository;
  private projectRepository: IProjectRepository;
  private userPayRateRepository: IUserPayRateRepository;
  private timesheetRepository: ITimesheetRepository;
  private breakTimeRepository: IBreakTimeRepository;
  private manager: EntityManager;

  constructor(
    @inject(TYPES.CompanyRepository) _companyRepository: ICompanyRepository,
    @inject(TYPES.ProjectRepository) _projectRepository: IProjectRepository,
    @inject(TYPES.UserRepository) userRepository: IUserRepository,
    @inject(TYPES.UserPayRateRepository) _userPayRateRepository: IUserPayRateRepository,
    @inject(TYPES.TimesheetRepository) _timesheetRepository: ITimesheetRepository,
    @inject(TYPES.BreakTimeRepository) _breakTimeRepository: IBreakTimeRepository
  ) {
    super(getRepository(TimeEntry));
    this.userRepository = userRepository;
    this.projectRepository = _projectRepository;
    this.companyRepository = _companyRepository;
    this.userPayRateRepository = _userPayRateRepository;
    this.timesheetRepository = _timesheetRepository;
    this.breakTimeRepository = _breakTimeRepository;
    this.manager = getManager();
  }

  getAllAndCount = async (args: IGetOptions): Promise<IGetAllAndCountResult<TimeEntry>> => {
    try {
      let { query = {}, select = [], ...rest } = args;
      const _select = select as (keyof TimeEntry)[];

      for (let key in query) {
        if (isArray(query[key])) {
          query[key] = In(query[key]);
        }
      }

      if ('needActiveTimeEntry' in query) {
        if (query.needActiveTimeEntry === false) {
          query = { ...query, endTime: Not(IsNull()) };
        }
        delete query.needActiveTimeEntry;
      }

      if ('afterStart' in query) {
        const startTime = query.afterStart;
        delete query.afterStart;
        query.startTime = MoreThanOrEqual(startTime);
      }

      if ('beforeEnd' in query) {
        const endTime = query.beforeEnd;
        delete query.beforeEnd;
        query.endTime = LessThanOrEqual(endTime);
      }

      const [rows, count] = await this.repo.findAndCount({
        where: query,
        ...(_select?.length && { select: _select }),
        ...rest,
      });
      return {
        count,
        rows,
      };
    } catch (err) {
      throw err;
    }
  };

  getActiveEntry = async (args: ITimeEntryActiveInput): Promise<TimeEntry | undefined> => {
    try {
      const company_id = args.company_id;
      const created_by = args.created_by;

      const timeEntry = await this.repo.findOne({
        endTime: IsNull(),
        company_id,
        created_by,
      });

      return timeEntry;
    } catch (err) {
      throw err;
    }
  };

  getWeeklyDetails = async (args: ITimeEntryWeeklyDetailsRepoInput): Promise<TimeEntry[]> => {
    try {
      const timesheet_id = args.timesheet_id;
      const startTime = args.startTime;
      const endTime = args.endTime;
      const company_id = args.company_id;
      const created_by = args.created_by;
      const client_id = args.client_id;
      const errors: string[] = [];

      if (isNil(startTime) || !isDate(startTime)) {
        errors.push(strings.startDateRequired);
      }
      if (isNil(endTime) || !isDate(endTime)) {
        errors.push(strings.endDateRequired);
      }
      if (isNil(company_id) || !isDate(company_id)) {
        errors.push(strings.companyIdRequired);
      }
      if (isNil(created_by) || !isDate(created_by)) {
        errors.push(strings.userIdRequired);
      }

      const query = this.repo
        .createQueryBuilder(entities.timeEntry)
        .where(`${entities.timeEntry}.company_id = :company_id`, { company_id })
        .andWhere(`${entities.timeEntry}.end_time IS NOT NULL`);

      if (client_id) {
        query
          .innerJoinAndSelect(`${entities.timeEntry}.project`, 'project')
          .andWhere('project.client_id = :client_id', { client_id });
      }

      if (created_by) {
        query.andWhere('created_by = :created_by', { created_by });
      }
      if (startTime) {
        query.andWhere('start_time >= :startTime', { startTime });
      }
      if (endTime) {
        query.andWhere('start_time <= :endTime', { endTime }); // using start_time for the end_time
      }
      if (timesheet_id) {
        query.andWhere('timesheet_id = :timesheet_id', { timesheet_id });
      }

      const entries = await query.orderBy(`${entities.timeEntry}.start_time`, 'DESC').getMany();

      return entries;
    } catch (err) {
      throw err;
    }
  };

  totalDuration = async (args: ITotalDurationInput): Promise<number> => {
    try {
      const company_id = args.company_id;
      const user_id = args?.user_id;
      const manager_id = args?.manager_id;
      const errors: string[] = [];

      if (isNil(company_id) || !isDate(company_id)) {
        errors.push(strings.companyIdRequired);
      }

      let total;
      if (user_id) {
        total = await this.manager.query(
          ` Select 
            sum(duration) from ${entities.timeEntry} as t
            left join ${entities.users} as u
            on u.id = t.created_by
            where t.company_id = $1
            AND t.created_by = $2
          `,
          [company_id, user_id]
        );
      }

      if (manager_id) {
        total = await this.manager.query(
          `Select 
           sum(duration) from ${entities.timeEntry} as t
           left join ${entities.users} as u
           on u.id = t.created_by
           where t.company_id = $1
           AND u.manager_id = $2
`,
          [company_id, manager_id]
        );
      }

      return total?.[0]?.sum ?? 0;
    } catch (err) {
      throw err;
    }
  };

  getTotalTimeInSeconds = async (args: ITimeEntryTotalDurationInput): Promise<number> => {
    try {
      const startTime = args.startTime;
      const endTime = args.endTime;
      const company_id = args.company_id;
      const project_id = args.project_id;
      const created_by = args.user_id;
      const client_id = args.client_id;
      const invoiced = args.invoiced ?? false;
      const errors: string[] = [];

      if (isNil(startTime) || isEmpty(startTime)) {
        errors.push(strings.startDateRequired);
      }
      if (isNil(endTime) || isEmpty(endTime)) {
        errors.push(strings.endDateRequired);
      }
      if (isNil(company_id) || !isDate(company_id)) {
        errors.push(strings.companyIdRequired);
      }

      const query = this.repo
        .createQueryBuilder(entities.timeEntry)
        .select('SUM(duration)', 'totalTime')
        .where(`${entities.timeEntry}.company_id = :company_id`, { company_id })
        .andWhere('start_time >= :startTime', { startTime })
        .andWhere('start_time <= :endTime', { endTime }); // using start_time for the end_time

      if (created_by) {
        query.andWhere('created_by = :created_by', { created_by });
      }

      if (project_id) {
        query.andWhere('project_id = :project_id', { project_id });
      }

      if (invoiced) {
        query.andWhere('invoice_id IS NOT NULL');
      }
      if (client_id) {
        query
          .leftJoin(`${entities.timeEntry}.project`, 'project')
          .andWhere('project.client_id = :client_id', { client_id });
      }
      const { totalTime } = await query.getRawOne();

      return totalTime ?? 0;
    } catch (err) {
      throw err;
    }
  };

  getUserTotalExpense = async (args: IUserTotalExpenseInput): Promise<number> => {
    try {
      const startTime = args.startTime;
      const endTime = args.endTime;
      const company_id = args.company_id;
      const user_id = args.user_id;
      const client_id = args.client_id;
      const timesheet_id = args.timesheet_id;
      const invoiced = args.invoiced || false;

      let where = ` WHERE t.${timeEntry.start_time} >= $1 AND t.${timeEntry.start_time} <= $2 AND t.${timeEntry.company_id} = $3 AND t.${timeEntry.created_by} = $4 AND p.client_id = $5`;
      const parameters = [startTime, endTime, company_id, user_id, client_id];
      if (timesheet_id) {
        where += ` AND t.${timeEntry.timesheet_id} = $6`;
        parameters.push(timesheet_id);
      }

      if (invoiced) {
        where += ` AND t.${timeEntry.invoice_id} IS NOT NULL`;
      }

      const queryResult = await this.manager.query(
        `WITH cte_time_entry_rate as (
          SELECT t.${timeEntry.duration}, t.${timeEntry.hourly_rate}, ((t.${timeEntry.duration}::numeric / 3600) * t.${timeEntry.hourly_rate}) AS expense FROM ${entities.timeEntry} as t 
          JOIN ${entities.projects} as p on t.${timeEntry.project_id} = p.id
          ${where}
        )
        SELECT ROUND(SUM(expense)::numeric, 2) AS total_expense FROM cte_time_entry_rate;
        `,
        parameters
      );

      return queryResult?.[0]?.total_expense ?? 0;
    } catch (err) {
      throw err;
    }
  };

  create = async (args: ITimeEntryCreateInput): Promise<TimeEntry> => {
    try {
      const startTime = args.startTime;
      const endTime = args.endTime;
      const clientLocation = args.clientLocation;
      const project_id = args.project_id;
      const company_id = args.company_id;
      const created_by = args.created_by;
      const entryType = args.entryType;
      const description = args.description?.trim();

      const errors: string[] = [];

      if (isNil(startTime)) {
        errors.push(strings.startDateRequired);
      }
      if (isNil(project_id) || isEmpty(project_id)) {
        errors.push(strings.projectIdRequired);
      }
      if (isNil(company_id) || isEmpty(company_id)) {
        errors.push(strings.companyRequired);
      }
      if (isNil(created_by) || isEmpty(created_by)) {
        errors.push(strings.userIdRequired);
      }
      if (!isNil(endTime) && !isNil(startTime) && endTime <= startTime) {
        errors.push(strings.endDateMustBeValidDate);
      }

      if (errors.length) {
        throw new apiError.ValidationError({
          details: errors,
        });
      }

      const activeTimeEntryCount = await this.repo.count({
        company_id,
        created_by,
        endTime: IsNull(),
      });

      if (activeTimeEntryCount) {
        throw new apiError.ValidationError({
          details: [strings.activeTimerNotStopped],
        });
      }

      const creator = await this.userRepository.getById({ id: created_by, relations: ['roles'] });
      if (!creator) {
        throw new apiError.NotFoundError({
          details: [strings.userNotFound],
        });
      }

      const company = await this.companyRepository.getById({ id: company_id });
      if (!company) {
        throw new apiError.NotFoundError({
          details: [strings.companyNotFound],
        });
      }

      const project = await this.projectRepository.getById({ id: project_id });
      if (!project) {
        throw new apiError.NotFoundError({
          details: [strings.projectNotFound],
        });
      }

      let duration: undefined | number = undefined;
      if (endTime) {
        const startDate = moment(startTime);
        const endDate = moment(endTime);
        duration = endDate.diff(startDate, 'seconds');
      }

      const payRate = await this.userPayRateRepository.getAll({
        query: {
          project_id,
          user_id: created_by,
        },
      });

      const hourlyRate = payRate?.[0]?.amount ?? 0;

      const hourlyInvoiceRate = payRate?.[0]?.invoiceRate ?? 0;

      const timeEntry = await this.repo.save({
        startTime,
        endTime,
        duration,
        clientLocation,
        project_id,
        company_id,
        created_by,
        hourlyRate,
        hourlyInvoiceRate,
        entryType,
        description,
      });
      return timeEntry;
    } catch (err) {
      throw err;
    }
  };

  update = async (args: ITimeEntryUpdateInput): Promise<TimeEntry> => {
    try {
      const id = args.id;
      const clientLocation = args.clientLocation;
      const approver_id = args.approver_id;
      const company_id = args.company_id;
      const created_by = args.created_by;
      const timesheet_id = args.timesheet_id;
      let project_id = args.project_id;
      let startTime = args.startTime;
      let endTime = args.endTime;
      let breakTime = args.breakTime as number;
      let startBreakTime = args.startBreakTime;
      let endBreakTime = args.endBreakTime;
      const description = args.description?.trim();

      const errors: string[] = [];

      if (isNil(id) || !isString(id)) {
        errors.push(strings.idRequired);
      }

      if (errors.length) {
        throw new apiError.ValidationError({
          details: errors,
        });
      }

      const found = await this.getById({ id });
      if (!found) {
        throw new NotFoundError({
          details: ['TimeEntry not found'],
        });
      }

      startTime = startTime ?? found.startTime;
      endTime = endTime ?? found.endTime;
      let duration: undefined | number = undefined;
      let totalBreakDuration: undefined | number = undefined;
      let breakDuration: number = 0;

      if (startBreakTime) {
        await this.breakTimeRepository.create({
          time_entry_id: id,
          startTime: startBreakTime,
        });
      }
      if (endBreakTime) {
        const breakTime = await this.breakTimeRepository.getSingleEntity({
          query: {
            endTime: IsNull(),
            time_entry_id: id,
          },
        });
        if (!breakTime) {
          throw new apiError.NotFoundError({
            details: ['Break Time not found or already stopped'],
          });
        }

        const startTime = moment(startBreakTime ?? breakTime.startTime);
        const endTime = moment(endBreakTime);
        breakDuration = endTime.diff(startTime, 'seconds');
        await this.breakTimeRepository.update({
          id: breakTime?.id,
          time_entry_id: id,
          startTime: startBreakTime,
          endTime: endBreakTime,
          duration: breakDuration,
        });
        totalBreakDuration = found.breakDuration + breakDuration;
      }
      if (startTime && endTime) {
        if (endTime <= startTime) {
          throw new apiError.ValidationError({
            details: [strings.endDateMustBeValidDate],
          });
        }

        const startDate = moment(startTime ?? found.startTime);
        const endDate = moment(endTime);
        duration = endDate.diff(startDate, 'seconds');
        duration = duration - found?.breakDuration;
      }

      const update = merge(found, {
        id,
        startTime,
        endTime,
        duration,
        clientLocation,
        approver_id,
        project_id,
        company_id,
        created_by,
        timesheet_id,
        description,
        breakDuration: totalBreakDuration,
      });

      let timeEntry = await this.repo.save(update);

      return timeEntry;
    } catch (err) {
      throw err;
    }
  };

  async bulkRemove(args: ITimeEntryBulkRemoveInput): Promise<TimeEntry[]> {
    try {
      const created_by = args?.created_by;
      const ids = args.ids;
      const client_id = args.client_id;
      const company_id = args.company_id;

      const timeEntries = await this.repo
        .createQueryBuilder(entities.timeEntry)
        .select(`${entities.timeEntry}.id`)
        .addSelect(`${entities.timeEntry}.startTime`)
        .where(`${entities.timeEntry}.company_id = :company_id `, { company_id })
        .andWhere(`${entities.timeEntry}.id = ANY(:ids)`, { ids })
        .andWhere('created_by = :created_by', { created_by })
        .innerJoinAndSelect(`${entities.timeEntry}.project`, 'project')
        .andWhere('project.client_id = :client_id', { client_id })
        .getMany();

      let timeEntryId: any = [];

      if (timeEntries.length > 0) {
        timeEntryId = timeEntries.map((timeEntry) => timeEntry.id);
      }

      await this.repo.delete({ id: In(timeEntryId) });

      return timeEntries;
    } catch (err) {
      throw err;
    }
  }

  getProjectItems = async (args: IProjectItemInput): Promise<IProjectItem[]> => {
    try {
      const startTime = args.startTime;
      const endTime = args.endTime;
      const company_id = args.company_id;
      const user_id = args.user_id;
      const client_id = args.client_id;
      const status = args.status;

      let queryResult;
      if (status) {
        queryResult = await this.manager.query(
          `
        SELECT t.${timeEntry.project_id},ts.${timesheet.id} as "timesheet_id",
        COALESCE(up.${userPayRate.amount}, 0) as "hourlyRate",
        COALESCE(SUM(t.${timeEntry.duration}), 0) AS "totalDuration",
        ROUND(COALESCE((SUM(t.${timeEntry.duration})::numeric / 3600), 0), 2) AS "totalHours",
        ROUND(COALESCE(((SUM(t.${timeEntry.duration})::numeric / 3600) * up.${userPayRate.amount}), 0), 2) AS "totalExpense" ,
        string_agg(distinct p.${projects.name}::text, ' , ') as "projectName"
        FROM ${entities.timeEntry} as t 
        JOIN ${entities.timesheet} as ts on t.${timeEntry.timesheet_id} = ts.id
        JOIN ${entities.projects} as p on t.${timeEntry.project_id} = p.id
        LEFT JOIN ${entities.userPayRate} up ON t.project_id = up.project_id AND t.created_by = up.user_id
        WHERE 
       
         t.timesheet_id IS NOT NULL
        AND t.${timeEntry.start_time} >= $1
        AND t.${timeEntry.start_time} <= $2
        AND t.${timeEntry.company_id} = $3
        AND t.${timeEntry.created_by} = $4
        AND p.client_id = $5
        AND t.${timeEntry.approval_status} =$6
        GROUP BY t.${timeEntry.project_id}, up.${userPayRate.amount},ts.${timesheet.id};
        `,
          [startTime, endTime, company_id, user_id, client_id, status]
        );
      } else {
        queryResult = await this.manager.query(
          `
          SELECT t.${timeEntry.project_id},ts.${timesheet.id} as "timesheet_id",
          COALESCE(up.${userPayRate.amount}, 0) as "hourlyRate",
          COALESCE(SUM(t.${timeEntry.duration}), 0) AS "totalDuration",
          ROUND(COALESCE((SUM(t.${timeEntry.duration})::numeric / 3600), 0), 2) AS "totalHours",
          ROUND(COALESCE(((SUM(t.${timeEntry.duration})::numeric / 3600) * up.${userPayRate.amount}), 0), 2) AS "totalExpense" ,
          string_agg(distinct p.${projects.name}::text, ' , ') as "projectName"
          FROM ${entities.timeEntry} as t
          JOIN ${entities.timesheet} as ts on t.${timeEntry.timesheet_id} = ts.id
          JOIN ${entities.projects} as p on t.${timeEntry.project_id} = p.id
          LEFT JOIN ${entities.userPayRate} up ON t.project_id = up.project_id AND t.created_by = up.user_id
          WHERE
         
           t.timesheet_id IS NOT NULL
          AND t.${timeEntry.start_time} >= $1
          AND t.${timeEntry.start_time} <= $2
          AND t.${timeEntry.company_id} = $3
          AND t.${timeEntry.created_by} = $4
          AND p.client_id = $5
          GROUP BY t.${timeEntry.project_id}, up.${userPayRate.amount},ts.${timesheet.id};
          `,
          [startTime, endTime, company_id, user_id, client_id]
        );
      }
      //  If approved status
      // WHERE t.approval_status = 'Approved'
      const items = queryResult?.map((item: any) => {
        return {
          ...item,
          totalDuration: Number(item.totalDuration),
          totalHours: Number(item.totalHours),
          totalExpense: Number(item.totalExpense),
        };
      });

      return items;
    } catch (err) {
      throw err;
    }
  };

  getDurationMap = async (args: IDurationMap): Promise<object> => {
    try {
      const timesheet_id = args.timesheet_id;
      const startTime = args.startTime;
      const endTime = args.endTime;
      const company_id = args.company_id;
      const user_id = args.user_id;
      const client_id = args.client_id;

      const queryResult = await this.manager.query(
        `
        SELECT to_char(t.${timeEntry.start_time}, 'yyyy-mm-dd') AS date, SUM(t.${timeEntry.duration})::numeric AS date_duration, t.${timeEntry.approval_status} as "approvalStatus", t.invoice_id
        FROM ${entities.timeEntry} AS t
        JOIN ${entities.projects} AS p ON t.project_id = p.id
        where t.${timeEntry.start_time} >= $1
        AND t.${timeEntry.start_time} <= $2
        AND t.${timeEntry.company_id} = $3
        AND t.${timeEntry.created_by} = $4
        AND p.${projects.client_id} = $5
        AND t.${timeEntry.timesheet_id} = $6
        AND t.${timeEntry.end_time} IS NOT NULL
        GROUP BY to_char(t.${timeEntry.start_time}, 'yyyy-mm-dd'), t.${timeEntry.approval_status}, t.${timeEntry.invoice_id};
        `,
        [startTime, endTime, company_id, user_id, client_id, timesheet_id]
      );

      const durationMap: DurationMap = {};

      const invoicedEntries: any[] = [];
      const remainingEntries: any[] = [];

      for (const entry of queryResult) {
        const duration = parseInt(entry.date_duration);
        if (entry.invoice_id) {
          if (entry.invoice_id in durationMap) {
            durationMap[entry.invoice_id][entry.date] = duration;
          } else {
            durationMap[entry.invoice_id] = {};
            durationMap[entry.invoice_id][entry.date] = duration;
          }
        } else {
          if (entry.approvalStatus in durationMap) {
            durationMap[entry.approvalStatus][entry.date] = duration;
          } else {
            durationMap[entry.approvalStatus] = {};
            durationMap[entry.approvalStatus][entry.date] = duration;
          }
        }
      }

      const dates = getIntervalDates(startTime, endTime);
      for (let statusOrInvoiceId in durationMap) {
        for (let date of dates) {
          if (!(date in durationMap[statusOrInvoiceId])) {
            durationMap[statusOrInvoiceId][date] = 0;
          }
        }
      }

      return durationMap;
    } catch (err) {
      throw err;
    }
  };

  approveRejectTimeEntries = async (args: ITimeEntriesApproveRejectInput): Promise<boolean> => {
    try {
      const ids = args.ids;
      const approver_id = args.approver_id;
      const approvalStatus = args.approvalStatus;

      await this.repo.update(
        {
          id: In(ids),
          invoice_id: IsNull(),
        },
        {
          approver_id: approver_id,
          approvalStatus,
        }
      );

      return true;
    } catch (err) {
      throw err;
    }
  };

  markApprovedTimeEntriesWithInvoice = async (args: IMarkApprovedTimeEntriesWithInvoice): Promise<boolean> => {
    try {
      const timesheet_id = args.timesheet_id;
      const invoice_id = args.invoice_id;

      await this.repo.update(
        {
          timesheet_id,
          approvalStatus: TimeEntryApprovalStatus.Approved,
          invoice_id: IsNull(),
        },
        {
          invoice_id,
        }
      );

      return true;
    } catch (err) {
      throw err;
    }
  };

  markedPeriodicApprovedTimeEntriesWithInvoice = async (
    args: IMarkPeriodicApprovedTimeEntriesWithInvoice
  ): Promise<boolean> => {
    try {
      const startTime = args.startDate + ' 00:00:00';
      const endTime = args.endDate + ' 23:59:59';
      const client_id = args.client_id;
      const user_id = args.user_id;
      const company_id = args.company_id;
      const invoice_id = args.invoice_id;

      await this.manager.query(
        `
          update ${entities.timeEntry} as t
          set invoice_id = $1 
          from ${entities.projects} as p
          where t.project_id = p.id
          and p.client_id = $2
          and start_time >= $3
          and start_time <= $4
          and created_by <= $5
          and t.company_id <= $6
          and approval_status >= '${TimeEntryApprovalStatus.Approved}';
        `,
        [invoice_id, client_id, startTime, endTime, user_id, company_id]
      );

      return true;
    } catch (err) {
      throw err;
    }
  };

  updateHourlyRate = async (args: ITimeEntryHourlyRateInput): Promise<boolean> => {
    try {
      const updated = await this.repo.update(
        {
          project_id: args.project_id,
          company_id: args.company_id,
          created_by: args.created_by,
          invoice_id: IsNull(),
        },
        {
          hourlyRate: args.hourlyRate,
          hourlyInvoiceRate: args.hourlyInvoiceRate,
        }
      );

      return true;
    } catch (err) {
      throw err;
    }
  };

  unlockTimeEntries = async (args: ITimeEntryUnlockInput): Promise<boolean> => {
    try {
      const timesheet_id = args.timesheet_id;
      const user_id = args.user_id;
      const company_id = args.company_id;
      const statusToUnlock = args.statusToUnlock;

      await this.repo.update(
        {
          timesheet_id,
          created_by: user_id,
          company_id,
          approvalStatus: statusToUnlock,
        },
        {
          approvalStatus: TimeEntryApprovalStatus.Pending,
        }
      );

      return true;

      return true;
    } catch (err) {
      throw err;
    }
  };

  bulkUpdate = async (args: ITimeEntryBulkUpdateInput): Promise<ITimeEntryBulkUpdateResult> => {
    try {
      const duration = args.duration;
      const project_id = args.project_id;
      const date = args.date;
      const timesheet_id = args.timesheet_id;

      const timeEntries = await this.repo
        .createQueryBuilder(entities.timeEntry)
        .select([
          'time_entries.id',
          'time_entries.startTime',
          'time_entries.endTime',
          'time_entries.duration',
          'time_entries.clientLocation',
          'time_entries.project_id',
          'time_entries.company_id',
          'time_entries.created_by',
          'time_entries.entryType',
          'time_entries.description',
        ])
        .where('project_id = :project_id', { project_id })
        .andWhere('approval_status = :approvalStatus', { approvalStatus: 'Pending' })
        .andWhere('timesheet_id = :timesheet_id', { timesheet_id })
        .andWhere('start_time >= :startTime', { startTime: date + 'T00:00:00' })
        .andWhere('start_time <= :endTime', { endTime: date + 'T23:59:59' }) // using start_time for the end_time
        .orderBy('end_time', 'ASC')
        .getMany();

      const totalDuration = timeEntries.reduce((acc, current) => {
        acc += current.duration;
        return acc;
      }, 0);

      const timesheet = await this.timesheetRepository.getById({
        id: timesheet_id,
        select: ['id', 'duration'],
      });

      if (duration <= totalDuration) {
        await this.updateLowDuration({
          entries: timeEntries,
          duration,
        });

        /**
         * Update the total timesheet duration
         * Subtract the remaining duration from the total timesheet duration
         */
        const remainingDuration = totalDuration - duration;
        if (remainingDuration >= 0 && timesheet) {
          const timesheetDuration = timesheet.duration - remainingDuration;
          await this.timesheetRepository.update({
            id: timesheet_id,
            duration: timesheetDuration,
          });
        }

        return {
          updated: true,
        };
      } else if (duration > totalDuration) {
        const additionalDuration = duration - totalDuration;
        const length = timeEntries.length;

        const result = await this.updateHighDuration({
          entries: timeEntries,
          duration: additionalDuration,
          timesheet,
        });

        return {
          updated: true,
          newEntryDetails: result.newEntryDetails,
        };
      }

      return {
        updated: true,
      };
    } catch (err) {
      throw err;
    }
  };

  /**
   * Update entries with the duration less than that of the total duration
   */
  updateLowDuration = (args: { entries: TimeEntry[]; duration: number }) => {
    try {
      const entries = args.entries;
      const entriesToUpdate: any = [];
      let remainingDuration = args.duration;

      for (let entry of entries) {
        if (entry.duration <= remainingDuration) {
          remainingDuration -= entry.duration;
          if (remainingDuration < 0) {
            remainingDuration = 0;
          }
        } else {
          entriesToUpdate.push({
            id: entry.id,
            startTime: entry.startTime,
            endTime: entry.startTime,
            duration: 0,
          });
        }
      }

      if (entriesToUpdate.length) {
        const endTime = moment(entriesToUpdate[0].endTime).utc().format('YYYY-MM-DDTHH:mm:ss');
        entriesToUpdate[0].duration = remainingDuration;
        entriesToUpdate[0].endTime = moment(entriesToUpdate[0].endTime)
          .utc()
          .add(remainingDuration, 'seconds')
          .toDate();
      }

      return this.repo.save(entriesToUpdate);
    } catch (err) {}
  };

  /**
   * Update entries with the duration greater than that of the total duration
   */
  updateHighDuration = async (args: { entries: TimeEntry[]; duration: number; timesheet: Timesheet | undefined }) => {
    try {
      const entries = args.entries;
      let duration = args.duration;
      const timesheet = args.timesheet;
      const length = entries.length;

      if (length) {
        const lastEntry = entries[length - 1];
        if (lastEntry.endTime) {
          const startTime = lastEntry?.startTime;
          let startDay: undefined | string;
          let endDay: undefined | string;
          let mondayStartTime: undefined | Date;
          let mondayEndTime: undefined | Date;

          let lastEntryEndTime = moment(lastEntry.endTime).utc().format('YYYY-MM-DDTHH:mm:ss');
          let endTime = moment(lastEntryEndTime).add(duration, 'seconds').format('YYYY-MM-DDTHH:mm:ss');

          if (startTime) {
            startDay = moment(startTime).format('dddd');
            endDay = moment(endTime).format('dddd');
          }

          // Check for breaking Sunday to Monday
          if (startDay === 'Sunday' && endDay === 'Monday') {
            mondayStartTime = new Date(moment(endTime).format('YYYY-MM-DD') + ' 00:00:00');
            mondayEndTime = new Date(endTime);

            endTime = moment(startTime).format('YYYY-MM-DD') + ' 23:59:59';

            const startDate = moment(startTime);
            const endDate = moment(endTime);

            /**
             * New duration after breaking from Sunday to Monday
             */
            duration = endDate.diff(startDate, 'seconds') - (lastEntry.duration ?? 0);
          }

          lastEntry.endTime = new Date(endTime);
          lastEntry.duration += duration;

          const savedEntry = await this.repo.save(lastEntry);

          /**
           * Update the total timesheet duration
           * Add the additional duration to the total timesheet duration
           */
          if (duration >= 0 && timesheet) {
            const timesheetDuration = timesheet.duration + duration;
            const t = await this.timesheetRepository.update({
              id: timesheet.id,
              duration: timesheetDuration,
            });
          }

          const result: any = {
            entries: [savedEntry],
          };

          if (mondayStartTime && mondayEndTime) {
            result.newEntryDetails = {
              startTime: mondayStartTime,
              endTime: mondayEndTime,
              clientLocation: lastEntry?.clientLocation ?? '',
              project_id: lastEntry.project_id,
              company_id: lastEntry.company_id,
              created_by: lastEntry.created_by,
              entryType: lastEntry.entryType,
              description: lastEntry.description,
            };
          }

          return result;
        }
      }

      return {
        entries,
        newEntryDetails: undefined,
      };
    } catch (err) {}
  };

  updateExpenseAndInvoicedDuration = async (
    args: IPeriodicTimeEntriesInput
  ): Promise<IExpenseAndInvoicedDuration[]> => {
    try {
      const startDate = args.startDate + ' 00:00:00';
      const endDate = args.endDate + ' 23:59:59';
      const client_id = args.client_id;
      const user_id = args.user_id;
      const company_id = args.company_id;

      const groupedTimesheet: IExpenseAndInvoicedDuration[] = await this.manager.query(
        ` 
          select
          timesheet_id,
          sum(duration) as invoiced_duration,
          round( sum( (t.duration::numeric / 3600) * t.hourly_invoice_rate )::numeric, 2 ) AS total_expense,
          round( sum( (t.duration::numeric / 3600) * t.hourly_rate)::numeric, 2 ) AS user_payment
          from time_entries as t
          join projects as p
          on t.project_id = p.id
          where start_time >= $1
          and start_time <= $2
          and created_by = $3
          and client_id = $4
          and t.company_id = $5
          and invoice_id is not null
          group by timesheet_id;
        `,
        [startDate, endDate, user_id, client_id, company_id]
      );

      if (groupedTimesheet?.length) {
        const values = groupedTimesheet.map((timesheet: any) => {
          return `('${timesheet.timesheet_id}'::uuid, ${timesheet.invoiced_duration}, ${timesheet.total_expense}, ${timesheet.user_payment})`;
        });

        await this.manager.query(
          `
            update timesheet
            set total_expense = t.total_expense, invoiced_duration = t.invoiced_duration, user_payment = t.user_payment
            from (
              values ${values.join(',')}
            ) as t (id, invoiced_duration, total_expense, user_payment)
            where timesheet.id = t.id;
          `
        );
      }

      return groupedTimesheet;
    } catch (err) {
      throw err;
    }
  };

  canGenerateInvoice = async (args: IPeriodicTimeEntriesInput): Promise<boolean> => {
    try {
      const startDate = args.startDate + ' 00:00:00';
      const endDate = args.endDate + ' 23:59:59';
      const client_id = args.client_id;
      const user_id = args.user_id;
      const company_id = args.company_id;

      const result = await this.manager.query(
        ` 
          select t.id
          from time_entries as t
          join projects as p
          on t.project_id = p.id
          where start_time >= $1
          and start_time <= $2
          and created_by = $3
          and client_id = $4
          and t.company_id = $5
          and invoice_id is NULL
          and approval_status = '${TimeEntryApprovalStatus.Approved}'
          limit 1
        `,
        [startDate, endDate, user_id, client_id, company_id]
      );

      return !!result?.length;
    } catch (err) {
      throw err;
    }
  };
}

function getIntervalDates(startTime: string, endTime: string): string[] {
  const dates: string[] = [];
  const startDate = moment(startTime);
  const endDate = moment(endTime);
  const diff = endDate.diff(startDate, 'days');

  let current = startDate;

  for (let i = 0; i <= diff; i++) {
    const date = current.format('YYYY-MM-DD');
    dates.push(date);
    current.add(1, 'days');
  }

  return dates;
}
