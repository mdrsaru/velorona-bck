import isNil from 'lodash/isNil';
import isString from 'lodash/isString';
import merge from 'lodash/merge';
import find from 'lodash/find';
import isArray from 'lodash/isArray';
import { inject, injectable } from 'inversify';
import { getRepository, Repository, In, SelectQueryBuilder, EntityManager, getManager, QueryResult } from 'typeorm';

import * as apiError from '../utils/api-error';
import { TYPES } from '../types';
import { entities, Role as RoleEnum } from '../config/constants';
import strings from '../config/strings';
import Project from '../entities/project.entity';
import BaseRepository from './base.repository';

import { ICompanyRepository } from '../interfaces/company.interface';
import { IUserRepository } from '../interfaces/user.interface';
import {
  IActiveProjectCountInput,
  IProjectCountInput,
  IProjectCreateInput,
  IProjectRepository,
  IProjectUpdateInput,
} from '../interfaces/project.interface';
import { IClientRepository } from '../interfaces/client.interface';
import { IGetOptions } from '../interfaces/paging.interface';
import { taskAssignmentTable, projects, company } from '../config/db/columns';
import project from '../config/inversify/project';

@injectable()
export default class ProjectRepository extends BaseRepository<Project> implements IProjectRepository {
  private companyRepository: ICompanyRepository;
  private userRepository: IUserRepository;
  private clientRepository: IClientRepository;
  private manager: EntityManager;
  constructor(
    @inject(TYPES.CompanyRepository) _companyRepository: ICompanyRepository,
    @inject(TYPES.UserRepository) _userRepository: IUserRepository,
    @inject(TYPES.ClientRepository) _clientRepository: IClientRepository
  ) {
    super(getRepository(Project));
    this.companyRepository = _companyRepository;
    this.userRepository = _userRepository;
    this.clientRepository = _clientRepository;
    this.manager = getManager();
  }

  countEntities = (args: IGetOptions): Promise<number> => {
    let { query = {}, select = [], ...rest } = args;

    // For array values to be used as In operator
    // https://github.com/typeorm/typeorm/blob/master/docs/find-options.md
    for (let key in query) {
      if (isArray(query[key])) {
        query[key] = In(query[key]);
      }
    }

    return this.repo.count({
      where: query,
      ...rest,
    });
  };

  countProjectInvolved = async (args: IProjectCountInput): Promise<number> => {
    try {
      let company_id = args.company_id;
      let user_id = args.user_id;

      let queryResult;

      queryResult = await this.manager.query(
        `SELECT count(*)
          FROM projects AS p
          JOIN tasks AS t ON t.project_id = p.id
          LEFT JOIN task_assignment AS ta ON ta.task_id = t.id
          where p.company_id = $1
          AND ta.user_id =$2
        `,
        [company_id, user_id]
      );

      return queryResult?.[0]?.count ?? 0;
    } catch (err) {
      throw err;
    }
  };

  countActiveProjectInvolved = async (args: IActiveProjectCountInput): Promise<number> => {
    try {
      let manager_id = args.manager_id;
      let company_id = args.company_id;
      let user_id = args.user_id;
      let archived = args.archived;
      let status = args.status;

      let queryResult;
      if (manager_id) {
        queryResult = await this.manager.query(
          `
          SELECT count(*)
          FROM ${entities.projects} AS p
          JOIN ${entities.tasks} AS t ON t.project_id = p.id
          where p.company_id = $1 AND p.archived = $2 AND p.status =$3 
          where t.manager_id = $4
          `,
          [company_id, archived, status, manager_id]
        );
      } else {
        queryResult = await this.manager.query(
          `SELECT count(*)
          FROM projects AS p
          JOIN tasks AS t ON t.project_id = p.id
          LEFT JOIN task_assignment AS ta ON ta.task_id = t.id
          where p.company_id = $1 AND p.archived = $2 AND p.status =$3 
          AND ta.user_id =$4
        `,
          [company_id, archived, status, user_id]
        );
      }
      return queryResult?.[0]?.count ?? 0;
    } catch (err) {
      throw err;
    }
  };

  create = async (args: IProjectCreateInput): Promise<Project> => {
    try {
      const name = args.name;
      const client_id = args.client_id;
      const company_id = args.company_id;
      const status = args.status;
      const archived = args.archived;

      const errors: string[] = [];

      if (isNil(name) || !isString(name)) {
        errors.push(strings.nameRequired);
      }
      if (isNil(client_id) || !isString(client_id)) {
        errors.push(strings.clientRequired);
      }
      if (isNil(company_id) || !isString(company_id)) {
        errors.push(strings.companyRequired);
      }

      if (errors.length) {
        throw new apiError.ValidationError({
          details: errors,
        });
      }

      const client = await this.clientRepository.getById({ id: client_id });

      if (!client) {
        throw new apiError.NotFoundError({
          details: [strings.clientNotFound],
        });
      }

      const company = await this.companyRepository.getById({ id: company_id });
      if (!company) {
        throw new apiError.NotFoundError({
          details: [strings.companyNotFound],
        });
      }

      const project = await this.repo.save({
        name,
        client_id,
        company_id,
        status,
        archived,
      });

      return project;
    } catch (err) {
      throw err;
    }
  };

  update = async (args: IProjectUpdateInput): Promise<Project> => {
    try {
      const id = args?.id;
      const name = args.name;
      const status = args.status;
      const archived = args.archived;

      const found = await this.getById({ id });
      if (!found) {
        throw new apiError.NotFoundError({
          details: [strings.projectNotFound],
        });
      }

      const update = merge(found, {
        id,
        name,
        status,
        archived,
      });

      let project = await this.repo.save(update);

      return project;
    } catch (err) {
      throw err;
    }
  };
}
