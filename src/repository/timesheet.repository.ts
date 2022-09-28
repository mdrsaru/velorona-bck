import { inject, injectable } from 'inversify';
import { isArray, isNil, isString, merge, get } from 'lodash';
import moment from 'moment';
import {
  Brackets,
  EntityManager,
  getManager,
  getRepository,
  In,
  SelectQueryBuilder,
  MoreThanOrEqual,
  LessThanOrEqual,
} from 'typeorm';

import strings from '../config/strings';
import { TYPES } from '../types';
import { ConflictError, NotFoundError, ValidationError } from '../utils/api-error';
import Timesheet from '../entities/timesheet.entity';
import BaseRepository from './base.repository';

import { IClientRepository } from '../interfaces/client.interface';
import { ICompanyRepository } from '../interfaces/company.interface';
import { IGetAllAndCountResult, IGetOptions, IPagingArgs } from '../interfaces/paging.interface';
import { IUserRepository } from '../interfaces/user.interface';
import {
  ITimesheetCreateInput,
  ITimesheetRepository,
  ITimesheetUpdateInput,
  ITimesheetCountInput,
  ITimesheetBulkCreateRepoInput,
} from '../interfaces/timesheet.interface';
import { entities, InvoiceSchedule } from '../config/constants';
import timesheet from '../config/inversify/timesheet';

@injectable()
export default class TimesheetRepository extends BaseRepository<Timesheet> implements ITimesheetRepository {
  private userRepository: IUserRepository;
  private clientRepository: IClientRepository;
  private companyRepository: ICompanyRepository;
  private manager: EntityManager;

  constructor(
    @inject(TYPES.UserRepository) userRepository: IUserRepository,
    @inject(TYPES.ClientRepository) _clientRepository: IClientRepository,
    @inject(TYPES.CompanyRepository) _companyRepository: ICompanyRepository
  ) {
    super(getRepository(Timesheet));
    this.userRepository = userRepository;
    this.clientRepository = _clientRepository;
    this.companyRepository = _companyRepository;
    this.manager = getManager();
  }

  getAllAndCount = async (args: IGetOptions): Promise<IGetAllAndCountResult<Timesheet>> => {
    try {
      let { query = {}, select = [], relations = [], ...rest } = args;
      let { role: roleName, search, weekStartDate, weekEndDate, ...where } = query;
      const _select = select as (keyof Timesheet)[];

      for (let key in where) {
        if (isArray(where[key])) {
          where[key] = In(where[key]);
        }
      }

      if (search) {
        relations.push('client', 'user');
      }

      // Using function based where query since it needs inner join where clause
      const _where = (qb: SelectQueryBuilder<Timesheet>) => {
        const queryBuilder = qb.where(where);
        if (weekStartDate && weekEndDate) {
          queryBuilder.andWhere({
            weekStartDate: MoreThanOrEqual(weekStartDate),
            weekEndDate: LessThanOrEqual(weekEndDate),
          });
        }
        if (search) {
          queryBuilder.andWhere(
            new Brackets((qb) => {
              qb.where('first_name ILike :search', { search: `%${search}%` ?? '' }).orWhere('name ILike :search', {
                search: `%${search}%` ?? '',
              });
            })
          );
        }
      };

      let [rows, count] = await this.repo.findAndCount({
        relations,
        where: _where,
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

  getTimesheetByManager = async (args: ITimesheetCountInput): Promise<IGetAllAndCountResult<Timesheet>> => {
    try {
      let company_id = args.company_id;
      let manager_id = args.manager_id;

      let queryResult;

      queryResult = await this.manager.query(
        `
        Select 
        t.id, 
        TO_CHAR(week_start_date, 'YYYY-MM-DD') as "weekStartDate",
        TO_CHAR(week_end_date, 'YYYY-MM-DD') as "weekEndDate",
        duration 
        FROM timesheet as t
        INNER JOIN Users as u ON t.user_id = u.id
        where u.manager_id = $1
        and t.company_id = $2
        
        `,
        [manager_id, company_id]
      );

      return queryResult ?? [];
    } catch (err) {
      throw err;
    }
  };

  countTimesheet = async (args: ITimesheetCountInput): Promise<number> => {
    try {
      let company_id = args.company_id;
      let manager_id = args.manager_id;

      let queryResult;

      queryResult = await this.manager.query(
        `
        Select 
        count(*) FROM timesheet as t
        INNER JOIN Users as u ON t.user_id = u.id
        where u.manager_id = $1
        and t.company_id = $2
        and (t.status='Pending'
		or t.status='PartiallyApproved')
        
        `,
        [manager_id, company_id]
      );
      return queryResult?.[0]?.count ?? 0;
    } catch (err) {
      throw err;
    }
  };

  create = async (args: ITimesheetCreateInput): Promise<Timesheet> => {
    try {
      const weekStartDate = args.weekStartDate;
      const weekEndDate = args.weekEndDate;
      const duration = args.duration;
      const totalExpense = args.totalExpense;
      const status = args.status;
      const user_id = args.user_id;
      const client_id = args.client_id;
      const company_id = args.company_id;
      const approver_id = args.approver_id;
      const lastApprovedAt = args.lastApprovedAt;
      const isSubmitted = args.isSubmitted;
      const lastSubmittedAt = args.lastSubmittedAt;

      const user = await this.userRepository.getById({ id: user_id });
      if (!user) {
        throw new NotFoundError({
          details: [strings.userNotFound],
        });
      }

      const client = await this.clientRepository.getById({ id: client_id });

      if (!client) {
        throw new NotFoundError({
          details: [strings.clientNotFound],
        });
      }

      const company = await this.companyRepository.getById({ id: company_id });

      if (!company) {
        throw new NotFoundError({
          details: [strings.companyNotFound],
        });
      }

      if (approver_id) {
        const approver = await this.userRepository.getById({ id: approver_id });

        if (!approver) {
          throw new NotFoundError({
            details: [strings.approverNotFound],
          });
        }
      }

      let startDate: any = moment(weekStartDate);
      let endDate: any = moment(weekEndDate);

      const daysDifference = endDate.diff(startDate, 'days') + 1;

      if (daysDifference !== 7) {
        throw new ValidationError({ details: ['Start Date and End Date should be 7 days apart'] });
      }

      startDate = startDate.format('YYYY-MM-DD');
      endDate = endDate.format('YYYY-MM-DD');

      const timesheets = await this.repo.count({
        user_id,
        client_id,
        weekStartDate: startDate,
        weekEndDate: endDate,
      });

      if (timesheets > 0) {
        throw new ConflictError({ details: [strings.timesheetAlreadyExistWithSameDetail] });
      }

      const res = await this.repo.save({
        weekStartDate: startDate,
        weekEndDate: endDate,
        duration,
        totalExpense,
        status,
        user_id,
        client_id,
        company_id,
        approver_id,
        lastApprovedAt,
        isSubmitted,
        lastSubmittedAt,
      });

      return res;
    } catch (err) {
      throw err;
    }
  };

  bulkCreate = async (args: ITimesheetBulkCreateRepoInput): Promise<string> => {
    try {
      this.repo.createQueryBuilder().insert().into(entities.timesheet).values(args.query).execute();

      return 'Bulk create successfully';
    } catch (err) {
      throw err;
    }
  };

  update = async (args: ITimesheetUpdateInput): Promise<Timesheet> => {
    try {
      const id = args.id;
      const duration = args.duration;
      const totalExpense = args.totalExpense;
      const status = args.status;
      const lastApprovedAt = args.lastApprovedAt;
      const isSubmitted = args.isSubmitted;
      const lastSubmittedAt = args.lastSubmittedAt;
      const approver_id = args.approver_id;
      const invoicedDuration = args.invoicedDuration;

      const errors: string[] = [];

      if (isNil(id) || !isString(id)) {
        errors.push(strings.idRequired);
      }

      if (errors.length) {
        throw new ValidationError({
          details: errors,
        });
      }

      if (approver_id) {
        const approver = await this.userRepository.getById({ id: approver_id });

        if (!approver) {
          throw new NotFoundError({
            details: [strings.approverNotFound],
          });
        }
      }

      const found = await this.getById({ id });
      if (!found) {
        throw new NotFoundError({
          details: ['Timesheet not found'],
        });
      }

      const update = merge(found, {
        id,
        duration,
        totalExpense,
        status,
        lastApprovedAt,
        isSubmitted,
        approver_id,
        lastSubmittedAt,
        invoicedDuration,
      });

      let timesheet = await this.repo.save(update);

      return timesheet;
    } catch (err) {
      throw err;
    }
  };

  getByFortnightOrMonth = async (args: IPagingArgs): Promise<IGetAllAndCountResult<Timesheet>> => {
    try {
      const skip = args?.skip ?? 0;
      const take = args?.take;
      const company_id = args.query?.company_id;
      const client_id = args.query?.client_id;
      const user_id = args.query?.user_id;

      let fields: any = [];

      if (company_id) {
        fields.push({
          column: 't.company_id',
          value: company_id,
        });
      }

      if (client_id) {
        fields.push({
          column: 't.client_id',
          value: client_id,
        });
      }

      if (user_id) {
        fields.push({
          column: 't.user_id',
          value: user_id,
        });
      }

      const conditions = [];
      const parameters = [];

      for (let i = 0; i < fields.length; i++) {
        parameters.push(fields[i].value);
        conditions.push(`${fields[i].column} = $${i + 1} `);
      }

      let where = '';
      if (conditions.length) {
        where = 'where ' + conditions.join(' and ');
      }

      let paginationQuery = '';
      if (!isNil(skip)) {
        paginationQuery += ` offset ${skip}`;
      }
      if (!isNil(take)) {
        paginationQuery += ` limit ${take}`;
      }

      /**
       * First Case: Biweekly - Get the biweekly_start_date(if not get created_at) of the client and truncate to Monday to calculate the biweekly timesheet
       * Second Case: Monthly - Truncate start date to month
       * Third Case: Weekly - Truncate start date to week
       */
      const cte = `
        with grouped_timesheet as (
          select
          sum(duration) as duration,
          round( sum(total_expense)::numeric, 2) as "totalExpense",
          round( sum(user_payment)::numeric, 2) as "userPayment",
          t.user_id as _user_id,
          t.client_id as _client_id,
          t.company_id as _company_id,
          c.invoice_schedule,
          string_agg(t.id::text, ',') as _id,
          string_agg(t.status::text, ',') as _status,
          max(last_approved_at) as _last_approved_at,
          CASE
            WHEN invoice_schedule = 'Biweekly' THEN
              CASE
                WHEN c.biweekly_start_date is NULL THEN (to_char(date_trunc('week', c.created_at), 'YYYY-MM-DD')::date + floor((week_start_date - to_char(date_trunc('week', c.created_at), 'YYYY-MM-DD')::date ) / 14)::int * 14)::text
                ELSE  (to_char(date_trunc('week', c.created_at), 'YYYY-MM-DD')::date + floor((week_start_date - to_char(date_trunc('week', c.created_at), 'YYYY-MM-DD')::date ) / 14)::int * 14)::text
              END
            WHEN invoice_schedule = 'Monthly'  THEN to_char(date_trunc('month', week_start_date::timestamp)::date, 'YYYY-MM-DD')
            ELSE to_char(date_trunc('week', week_start_date::timestamp)::date, 'YYYY-MM-DD')
          END AS start_date,
          user_id, client_id, t.company_id
          from timesheet as t inner join clients as c on c.id = t.client_id
          ${where}
          group by start_date, t.client_id, t.user_id, t.company_id, c.invoice_schedule
          order by start_date desc
        )
      `;

      const countResult = await this.manager.query(
        `
          ${cte}
          select count(start_date) from grouped_timesheet;
        `,
        parameters
      );

      let queryResult = await this.manager.query(
        `${cte}
          select
          start_date as "weekStartDate",
          invoice_schedule as period,
          case
            when invoice_schedule = 'Biweekly' then to_char(start_date::date + 13, 'YYYY-MM-DD')
            when invoice_schedule = 'Monthly' then to_char(start_date::date + interval '1 month' - interval '1 day', 'YYYY-MM-DD')
            else to_char(start_date::date + 6, 'YYYY-MM-DD')
          end as "weekEndDate",
          _status as status,
          _last_approved_at as "lastApprovedAt",
          _company_id as company_id,
          _id as id,
          _user_id as user_id,
          invoice_schedule as period,
          client_id,
          duration,
          "totalExpense",
          "userPayment"
          from grouped_timesheet ${paginationQuery};
        `,
        parameters
      );

      return {
        count: Number(get(countResult, '[0].count', 0)),
        rows: queryResult,
      };
    } catch (err) {
      throw err;
    }
  };
}
