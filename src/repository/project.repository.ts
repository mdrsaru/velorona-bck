import isNil from 'lodash/isNil';
import isString from 'lodash/isString';
import merge from 'lodash/merge';
import isArray from 'lodash/isArray';
import { inject, injectable } from 'inversify';
import { getRepository, In, SelectQueryBuilder, EntityManager, getManager, ILike } from 'typeorm';

import * as apiError from '../utils/api-error';
import { TYPES } from '../types';
import strings from '../config/strings';
import Project from '../entities/project.entity';
import BaseRepository from './base.repository';

import { ICompanyRepository } from '../interfaces/company.interface';
import { IUserRepository } from '../interfaces/user.interface';
import {
  IActiveProjectCountInput,
  IAssignProjectToUsers,
  IGetUsersAssignedProject,
  IProjectCountInput,
  IProjectCreateInput,
  IProjectRepository,
  IProjectUpdateInput,
  IRemoveAssignProjectToUsers,
} from '../interfaces/project.interface';
import { IClientRepository } from '../interfaces/client.interface';
import { IGetAllAndCountResult, IGetOptions } from '../interfaces/paging.interface';
import User from '../entities/user.entity';
import { entities } from '../config/constants';

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

  getAllAndCount = async (args: IGetOptions): Promise<IGetAllAndCountResult<Project>> => {
    try {
      let { query = {}, select = [], relations = [], ...rest } = args;
      let { role: roleName, search, ...where } = query;
      const _select = select as (keyof Project)[];

      for (let key in query) {
        if (isArray(query[key])) {
          query[key] = In(query[key]);
        }
      }

      let _searchWhere: any = [];

      if (search) {
        _searchWhere = [
          {
            name: ILike(`%${search}%`),
            ...where,
          },
        ];
      }

      if (query.user_id) {
        relations.push('users');
      }

      // Using function based where query since it needs inner join where clause
      const _where = (qb: SelectQueryBuilder<User>) => {
        let { user_id, ...where } = query;

        const queryBuilder = qb.where(_searchWhere.length ? _searchWhere : where);

        if (user_id) {
          queryBuilder.andWhere('user_id = :userId', { userId: user_id ?? '' });
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
        `
        with temp_table as (
        Select 
        distinct(projects.id) AS project_id FROM projects 
		INNER JOIN user_project ON 
		user_project.project_id = projects.id
        where user_id = $1 AND 
        company_id = $2
       )
       select count(project_id) from temp_table;
        `,
        [user_id, company_id]
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
          with temp_table as (
            Select 
            distinct(projects.id) AS project_id FROM projects 
            INNER JOIN user_project ON 
			user_project.project_id = projects.id
            LEFT JOIN users ON
            users.id = user_project.user_id
            where 
            projects.company_id = $1 AND
            projects.archived =$2 AND 
            projects.status = $3 AND 
            users.manager_id = $4
            
           )
           select count(project_id) from temp_table;
          `,
          [company_id, archived, status, manager_id]
        );
      } else {
        queryResult = await this.manager.query(
          `
          with temp_table as (
          Select 
          distinct(projects.id) AS project_id FROM projects 
          INNER JOIN user_project ON 
		  user_project.project_id = projects.id
          where 
          projects.company_id = $1 AND
          projects.archived =$2 AND 
          projects.status = $3 AND 
          user_id = $4
         )
         select count(project_id) from temp_table;
       
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
      const name = args.name.trim();
      const client_id = args.client_id;
      const company_id = args.company_id;
      const status = args.status;
      const archived = args.archived;
      const user_ids = args.user_ids;

      const errors: string[] = [];

      if (isNil(name) || !isString(name)) {
        errors.push(strings.nameRequired);
      }
      if (isNil(company_id) || !isString(company_id)) {
        errors.push(strings.companyRequired);
      }

      if (errors.length) {
        throw new apiError.ValidationError({
          details: errors,
        });
      }

      const projectFound = await this.getAll({
        query: {
          name,
          client_id,
          company_id,
        },
      });

      if (projectFound.length) {
        throw new apiError.ConflictError({
          details: [strings.projectAlreadyExist],
        });
      }

      if (client_id) {
        let client = await this.clientRepository.getById({ id: client_id });

        if (!client) {
          throw new apiError.NotFoundError({
            details: [strings.clientNotFound],
          });
        }
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

      if (user_ids) {
        const arg = {
          user_id: user_ids,
          project_id: project.id,
        };
        await this.assignProjectToUsers(arg);
      }

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
      const client_id = args.client_id;

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
        client_id,
      });

      let project = await this.repo.save(update);

      return project;
    } catch (err) {
      throw err;
    }
  };

  async assignProjectToUsers(args: IAssignProjectToUsers): Promise<Project> {
    try {
      const user_id = args.user_id;
      const id = args.project_id;

      const found = await this.getById({ id });
      if (!found) {
        throw new apiError.NotFoundError({
          details: [strings.taskNotFound],
        });
      }

      const existingUsers = await this.userRepository.getAll({
        query: {
          id: user_id,
        },
      });

      if (existingUsers?.length !== user_id.length) {
        throw new apiError.ValidationError({
          details: [strings.userNotFound],
        });
      }
      const update = merge(found, {
        id,
        users: existingUsers,
      });

      let project = await this.repo.save(update);
      return project;
    } catch (err) {
      throw err;
    }
  }

  async removeAssignProjectToUsers(args: IRemoveAssignProjectToUsers): Promise<Project> {
    try {
      const user_id = args.user_id;
      const project_id = args.project_id;

      const projectFound: any = await this.getSingleEntity({
        query: {
          id: project_id,
        },
      });

      const queryResult = await this.manager.query(
        `
      Delete from user_project
      where user_id=$1
      and
      project_id = $2

      `,
        [user_id, project_id]
      );

      return projectFound;
    } catch (err) {
      throw err;
    }
  }

  async removeAssignProject(args: IRemoveAssignProjectToUsers): Promise<Project> {
    try {
      const project_id = args.project_id;

      const projectFound: any = await this.getSingleEntity({
        query: {
          id: project_id,
        },
      });

      const queryResult = await this.manager.query(
        `
      Delete from user_project
      where 
      project_id = $1

      `,
        [project_id]
      );
      return projectFound;
    } catch (err) {
      throw err;
    }
  }

  async getUsersAssignedProject(args: IGetUsersAssignedProject): Promise<any> {
    try {
      const user_id = args.user_id;
      const project_id = args.project_id;

      const queryResult = await this.manager.query(
        `
      Select * from user_project
      where user_id=$1
      and
      project_id = $2

      `,
        [user_id, project_id]
      );

      return queryResult;
    } catch (err) {
      throw err;
    }
  }
}
