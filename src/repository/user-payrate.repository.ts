import { inject, injectable } from 'inversify';
import { getRepository, In, SelectQueryBuilder } from 'typeorm';
import isNil from 'lodash/isNil';
import isString from 'lodash/isString';
import merge from 'lodash/merge';

import * as apiError from '../utils/api-error';
import { TYPES } from '../types';
import strings from '../config/strings';

import BaseRepository from './base.repository';

import {
  IUserPayRateCreateInput,
  IUserPayRateRepository,
  IUserPayRateUpdateInput,
} from '../interfaces/user-payrate.interface';
import { IUserRepository } from '../interfaces/user.interface';
import { IProjectRepository } from '../interfaces/project.interface';
import UserPayRate from '../entities/user-payrate.entity';
import { IGetAllAndCountResult, IGetOptions } from '../interfaces/paging.interface';
import { isArray } from 'lodash';

@injectable()
export default class UserPayRateRepository extends BaseRepository<UserPayRate> implements IUserPayRateRepository {
  private userRepository: IUserRepository;
  private projectRepository: IProjectRepository;
  constructor(
    @inject(TYPES.ProjectRepository) _projectRepository: IProjectRepository,
    @inject(TYPES.UserRepository) _userRepository: IUserRepository
  ) {
    super(getRepository(UserPayRate));
    this.projectRepository = _projectRepository;
    this.userRepository = _userRepository;
  }

  getAllAndCount = async (args: IGetOptions): Promise<IGetAllAndCountResult<UserPayRate>> => {
    try {
      let { query = {}, select = [], relations = [], ...rest } = args;
      let { search, company_id, ...where } = query;
      const _select = select as (keyof UserPayRate)[];

      for (let key in query) {
        if (isArray(query[key])) {
          query[key] = In(query[key]);
        }
      }
      relations.push('user');

      const _where = (qb: SelectQueryBuilder<UserPayRate>) => {
        const queryBuilder = qb.where(where);

        if (company_id) {
          queryBuilder.andWhere('company_id = :companyId', { companyId: company_id });
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

  create = async (args: IUserPayRateCreateInput): Promise<UserPayRate> => {
    try {
      const startDate = args.startDate;
      const endDate = args.endDate;
      const amount = args.amount;
      const user_id = args.user_id;
      const project_id = args.project_id;
      const invoiceRate = args.invoiceRate;

      const errors: string[] = [];

      if (isNil(user_id) || !isString(user_id)) {
        errors.push(strings.EmployeeIdRequired);
      }
      if (isNil(project_id) || !isString(project_id)) {
        errors.push(strings.projectIdRequired);
      }

      if (errors.length) {
        throw new apiError.ValidationError({
          details: errors,
        });
      }

      const employee = await this.userRepository.getById({ id: user_id, relations: ['roles'] });
      if (!employee) {
        throw new apiError.NotFoundError({
          details: [strings.userNotFound],
        });
      }
      const project = await this.projectRepository.getById({ id: project_id });
      if (!project) {
        throw new apiError.NotFoundError({
          details: [strings.projectNotFound],
        });
      }

      const UserPayRate = await this.repo.save({
        startDate,
        endDate,
        amount,
        user_id,
        project_id,
        invoiceRate,
      });

      return UserPayRate;
    } catch (err) {
      throw err;
    }
  };

  update = async (args: IUserPayRateUpdateInput): Promise<UserPayRate> => {
    try {
      const id = args.id;
      const startDate = args.startDate;
      const endDate = args.endDate;
      const amount = args.amount;
      const user_id = args.user_id;
      const project_id = args.project_id;
      const invoiceRate = args.invoiceRate;

      const found = await this.getById({ id });
      if (!found) {
        throw new apiError.NotFoundError({
          details: [strings.userPayRateNotFound],
        });
      }
      const update = merge(found, {
        id,
        startDate,
        endDate,
        amount,
        user_id,
        project_id,
        invoiceRate,
      });

      let UserPayRate = await this.repo.save(update);

      return UserPayRate;
    } catch (err) {
      throw err;
    }
  };
}
