import { inject, injectable } from 'inversify';
import { EntityManager, getManager, getRepository, In, SelectQueryBuilder } from 'typeorm';
import BaseRepository from './base.repository';

import { TYPES } from '../types';
import strings from '../config/strings';
import User from '../entities/user.entity';
import { UserProjectStatus } from '../config/constants';

import { IUserRepository } from '../interfaces/user.interface';
import { IClientRepository } from '../interfaces/client.interface';
import { isArray, merge } from 'lodash';
import UserProject from '../entities/user-project.entity';
import { IProjectRepository } from '../interfaces/project.interface';
import {
  IUserProjectChangeStatus,
  IUserProjectMakeInactive,
  IUserProjectQueryInput,
  IUserProjectRepository,
} from '../interfaces/user-project.interface';

import * as apiError from '../utils/api-error';
import { IGetAllAndCountResult, IGetOptions } from '../interfaces/paging.interface';

@injectable()
export default class UserProjectRepository extends BaseRepository<UserProject> implements IUserProjectRepository {
  private manager: EntityManager;
  private userRepository: IUserRepository;

  constructor(
    @inject(TYPES.UserRepository) _userRepository: IUserRepository,
    @inject(TYPES.ClientRepository) _clientRepository: IClientRepository,
    @inject(TYPES.ProjectRepository) _projectRepository: IProjectRepository
  ) {
    super(getRepository(UserProject));
    this.userRepository = _userRepository;
    this.manager = getManager();
  }

  getAllAndCount = async (args: IGetOptions): Promise<IGetAllAndCountResult<UserProject>> => {
    try {
      let { query = {}, select = [], relations = [], ...rest } = args;
      let { search, client_id, company_id, ...where } = query;
      const _select = select as (keyof UserProject)[];

      for (let key in query) {
        if (isArray(query[key])) {
          query[key] = In(query[key]);
        }
      }
      relations.push('user', 'project');

      const _where = (qb: SelectQueryBuilder<UserProject>) => {
        const queryBuilder = qb.where(where);

        if (client_id) {
          queryBuilder.andWhere('client_id = :clientId', { clientId: client_id });
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

  getDetails = async (args: IUserProjectQueryInput): Promise<any> => {
    const user_id = args.user_id;
    const client_id = args.client_id;
    try {
      const queryResult = await this.manager.query(
        `
        Select 
        distinct p.id as "projectId",
        p.name as "projectName",
        up.user_id,
        uc.status as "userClientStatus",
        up.status "userProjectStatus"
        from user_project as up
        join projects as p on p.id = up.project_id
        left join users_clients as uc on uc.client_id = p.client_id
        join clients as c on c.id = uc.client_id
        where up.user_id=$1 
        and uc.client_id = $2
        and uc.status = $3
        and up.status=$3
        and c.archived = false
      `,
        [user_id, client_id, 'Active']
      );

      return queryResult;
    } catch (err) {
      throw err;
    }
  };

  update = async (args: IUserProjectChangeStatus): Promise<UserProject> => {
    try {
      const project_id = args.project_id;
      const user_id = args.user_id;
      const status = args.status;

      const found = await this.getSingleEntity({
        query: {
          project_id,
          user_id,
        },
      });

      if (!found) {
        throw new apiError.NotFoundError({
          details: ['User is not assigned to this project'],
        });
      }
      // if (found) {
      //   await this.changeStatusToInactive({
      //     user_id,
      //   });
      // }
      const update = merge(found, {
        user_id,
        project_id,
        status,
      });
      let userProjectFound = await this.repo.save(update);
      return userProjectFound;
    } catch (err) {
      throw err;
    }
  };

  changeStatusToInactive = async (args: IUserProjectMakeInactive): Promise<User> => {
    try {
      const user_id = args.user_id;

      let user = await this.userRepository.getById({ id: user_id, relations: ['roles'] });

      if (!user) {
        throw new apiError.NotFoundError({ details: [strings.userNotFound] });
      }

      await this.repo.update({ user_id }, { status: UserProjectStatus.Inactive });

      return user;
    } catch (err) {
      throw err;
    }
  };
}
