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
import { entities, TimeEntryApprovalStatus } from '../config/constants';
import { timeEntry, userPayRate, projects } from '../config/db/columns';
import * as apiError from '../utils/api-error';
import TimeEntry from '../entities/time-entry.entity';
import { NotFoundError } from '../utils/api-error';
import BaseRepository from './base.repository';

import { ICompanyRepository } from '../interfaces/company.interface';
import { IProjectRepository } from '../interfaces/project.interface';
import { ITaskRepository } from '../interfaces/task.interface';
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
} from '../interfaces/time-entry.interface';
import { IUserRepository } from '../interfaces/user.interface';
import { IGetOptions, IGetAllAndCountResult } from '../interfaces/paging.interface';

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
  private taskRepository: ITaskRepository;
  private manager: EntityManager;

  constructor(
    @inject(TYPES.CompanyRepository) _companyRepository: ICompanyRepository,
    @inject(TYPES.ProjectRepository) _projectRepository: IProjectRepository,
    @inject(TYPES.UserRepository) userRepository: IUserRepository,
    @inject(TYPES.TaskRepository) _taskRepository: ITaskRepository
  ) {
    super(getRepository(TimeEntry));
    this.userRepository = userRepository;
    this.projectRepository = _projectRepository;
    this.companyRepository = _companyRepository;
    this.taskRepository = _taskRepository;
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

  getTotalTimeInSeconds = async (args: ITimeEntryTotalDurationInput): Promise<number> => {
    try {
      const startTime = args.startTime;
      const endTime = args.endTime;
      const company_id = args.company_id;
      const project_id = args.project_id;
      const created_by = args.user_id;
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
        .where('company_id = :company_id', { company_id })
        .andWhere('created_by = :created_by', { created_by })
        .andWhere('start_time >= :startTime', { startTime })
        .andWhere('start_time <= :endTime', { endTime }); // using start_time for the end_time

      if (project_id) {
        query.andWhere('project_id = :project_id', { project_id });
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

      const queryResult = await this.manager.query(
        `WITH cte_time_entry_payrate as (
          SELECT t.${timeEntry.duration}, up.${userPayRate.amount}, ((t.${timeEntry.duration}::numeric / 3600) * up.${userPayRate.amount}) AS expense FROM ${entities.timeEntry} as t 
          LEFT JOIN ${entities.userPayRate} AS up ON t.${timeEntry.project_id} = up.${userPayRate.project_id}
          JOIN ${entities.projects} as p on up.${userPayRate.project_id} = p.id
          WHERE t.${timeEntry.start_time} >= $1 AND t.${timeEntry.start_time} <= $2 AND t.${timeEntry.company_id} = $3 AND t.${timeEntry.created_by} = $4 AND up.${userPayRate.user_id} = $4 AND p.client_id = $5
        )
        SELECT ROUND(SUM(expense)::numeric, 2) AS total_expense FROM cte_time_entry_payrate;
        `,
        [startTime, endTime, company_id, user_id, client_id]
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
      const task_id = args.task_id;

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
      if (isNil(task_id) || isEmpty(task_id)) {
        errors.push(strings.taskIdRequired);
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

      const task = await this.taskRepository.getById({ id: task_id });
      if (!task) {
        throw new apiError.NotFoundError({
          details: [strings.taskNotFound],
        });
      }

      if (task.project_id !== project_id) {
        throw new apiError.NotFoundError({
          details: [strings.taskNotBelongToProject],
        });
      }

      let duration: undefined | number = undefined;
      if (endTime) {
        const startDate = moment(startTime);
        const endDate = moment(endTime);
        duration = endDate.diff(startDate, 'seconds');
      }

      const timeEntry = await this.repo.save({
        startTime,
        endTime,
        duration,
        clientLocation,
        project_id,
        company_id,
        created_by,
        task_id,
      });

      return timeEntry;
    } catch (err) {
      throw err;
    }
  };

  update = async (args: ITimeEntryUpdateInput): Promise<TimeEntry> => {
    try {
      const id = args.id;
      const endTime = args.endTime;
      const clientLocation = args.clientLocation;
      const approver_id = args.approver_id;
      const company_id = args.company_id;
      const created_by = args.created_by;
      const task_id = args.task_id;
      const timesheet_id = args.timesheet_id;
      let project_id = args.project_id;
      let startTime = args.startTime;

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

      if (!isNil(task_id) && !isEmpty(task_id)) {
        const task = await this.taskRepository.getById({ id: task_id });
        if (!task) {
          throw new apiError.NotFoundError({
            details: [strings.taskNotFound],
          });
        }

        project_id = task.project_id;
      }

      startTime = startTime ?? found.startTime;
      let duration: undefined | number = undefined;
      if (endTime) {
        if (endTime <= startTime) {
          throw new apiError.ValidationError({
            details: [strings.endDateMustBeValidDate],
          });
        }

        const startDate = moment(startTime ?? found.startTime);
        const endDate = moment(endTime);
        duration = endDate.diff(startDate, 'seconds');
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
        task_id,
        timesheet_id,
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

      const queryResult = await this.manager.query(
        `
        SELECT t.${timeEntry.project_id},
        COALESCE(up.${userPayRate.amount}, 0) as "hourlyRate",
        COALESCE(SUM(t.${timeEntry.duration}), 0) AS "totalDuration",
        ROUND(COALESCE((SUM(t.${timeEntry.duration})::numeric / 3600), 0), 2) AS "totalHours",
        ROUND(COALESCE(((SUM(t.${timeEntry.duration})::numeric / 3600) * up.${userPayRate.amount}), 0), 2) AS "totalExpense" 
        FROM ${entities.timeEntry} as t 
        JOIN ${entities.projects} as p on t.${timeEntry.project_id} = p.id
        LEFT JOIN ${entities.userPayRate} up ON t.project_id = up.project_id
        WHERE t.approval_status = 'Approved'
        AND t.timesheet_id IS NOT NULL
        AND t.invoice_id IS NULL
        AND t.${timeEntry.start_time} >= $1
        AND t.${timeEntry.start_time} <= $2
        AND t.${timeEntry.company_id} = $3
        AND t.${timeEntry.created_by} = $4
        AND p.client_id = $5
        GROUP BY t.${timeEntry.project_id}, up.${userPayRate.amount};
        `,
        [startTime, endTime, company_id, user_id, client_id]
      );

      return queryResult;
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

  markApprovedTimeEntriesWithInvoice = async (args: any): Promise<boolean> => {
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
