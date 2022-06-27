import { inject, injectable } from 'inversify';
import { isArray, isNil, isString, merge } from 'lodash';
import moment from 'moment';
import { Brackets, getRepository, In, SelectQueryBuilder } from 'typeorm';

import strings from '../config/strings';
import { TYPES } from '../types';
import { ConflictError, NotFoundError, ValidationError } from '../utils/api-error';
import Timesheet from '../entities/timesheet.entity';
import BaseRepository from './base.repository';

import { IClientRepository } from '../interfaces/client.interface';
import { ICompanyRepository } from '../interfaces/company.interface';
import { IGetAllAndCountResult, IGetOptions } from '../interfaces/paging.interface';
import { IUserRepository } from '../interfaces/user.interface';
import { ITimesheetCreateInput, ITimesheetRepository, ITimesheetUpdateInput } from '../interfaces/timesheet.interface';

@injectable()
export default class TimesheetRepository extends BaseRepository<Timesheet> implements ITimesheetRepository {
  private userRepository: IUserRepository;
  private clientRepository: IClientRepository;
  private companyRepository: ICompanyRepository;
  constructor(
    @inject(TYPES.UserRepository) userRepository: IUserRepository,
    @inject(TYPES.ClientRepository) _clientRepository: IClientRepository,
    @inject(TYPES.CompanyRepository) _companyRepository: ICompanyRepository
  ) {
    super(getRepository(Timesheet));
    this.userRepository = userRepository;
    this.clientRepository = _clientRepository;
    this.companyRepository = _companyRepository;
  }

  getAllAndCount = async (args: IGetOptions): Promise<IGetAllAndCountResult<Timesheet>> => {
    try {
      let { query = {}, select = [], relations = [], ...rest } = args;
      let { role: roleName, search, ...where } = query;
      const _select = select as (keyof Timesheet)[];

      for (let key in query) {
        if (isArray(query[key])) {
          query[key] = In(query[key]);
        }
      }

      if (search) {
        relations.push('client', 'user');
      }

      // Using function based where query since it needs inner join where clause
      const _where = (qb: SelectQueryBuilder<Timesheet>) => {
        const queryBuilder = qb.where(where);

        if (search) {
          queryBuilder.andWhere(
            new Brackets((qb) => {
              qb.where('first_name = :search', { search: search ?? '' }).orWhere('name=:search', {
                search: search ?? '',
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
}
