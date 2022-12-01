import { inject, injectable } from 'inversify';
import { EntityManager, getManager, getRepository, In, SelectQueryBuilder } from 'typeorm';
import BaseRepository from './base.repository';

import { TYPES } from '../types';
import strings from '../config/strings';
import User from '../entities/user.entity';
import UserClient from '../entities/user-client.entity';
import { entities, Role, UserClientStatus } from '../config/constants';
import * as apiError from '../utils/api-error';

import { IUserRepository } from '../interfaces/user.interface';
import {
  IUserClientCreate,
  IUserClientRepository,
  IUserIdQuery,
  IUserClientMakeInactive,
} from '../interfaces/user-client.interface';
import { IClientRepository } from '../interfaces/client.interface';
import { isArray } from 'util';
import { IGetAllAndCountResult, IGetOptions } from '../interfaces/paging.interface';

@injectable()
export default class UserClientRepository extends BaseRepository<UserClient> implements IUserClientRepository {
  private userRepository: IUserRepository;
  private clientRepository: IClientRepository;
  private manager: EntityManager;

  constructor(
    @inject(TYPES.UserRepository) _userRepository: IUserRepository,
    @inject(TYPES.ClientRepository) _clientRepository: IClientRepository
  ) {
    super(getRepository(UserClient));
    this.userRepository = _userRepository;
    this.clientRepository = _clientRepository;
    this.manager = getManager();
  }

  getAllAndCount = async (args: IGetOptions): Promise<IGetAllAndCountResult<UserClient>> => {
    try {
      let { query = {}, select = [], relations = [], ...rest } = args;
      let { search, company_id, ...where } = query;
      const _select = select as (keyof UserClient)[];

      for (let key in query) {
        if (isArray(query[key])) {
          query[key] = In(query[key]);
        }
      }
      relations.push('client');

      const _where = (qb: SelectQueryBuilder<UserClient>) => {
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

  getDetails = async (args: IUserIdQuery): Promise<any> => {
    const user_id = args.user_id;
    try {
      const queryResult = await this.manager.query(
        `
      Select 
      uc.user_id,
      uc.status,
      c.name as "clientName",
      p.id as "projectId",
      p.name as "projectName",
      ur.amount as "userRate",
      ur.invoice_rate as "invoiceRate" ,
      ur.id as "userPayRateId"
      from ${entities.clients} as c 
      join ${entities.usersClients} as uc on c.id = uc.client_id
      left join ${entities.projects} as p on p.client_id = c.id
      left join ${entities.userProject} as up on up.project_id = p.id
      left join ${entities.userPayRate} as ur on ur.project_id = p.id
      where uc.user_id=$1 
      and (up.user_id = $1 or up.user_id is NULL)
      and (ur.user_id = $1 or ur.user_id is NULL)
      `,
        [user_id]
      );
      return queryResult;
    } catch (err) {
      throw err;
    }
  };

  create = async (args: IUserClientCreate): Promise<UserClient> => {
    try {
      const client_id = args.client_id;
      const user_id = args.user_id;

      let user = await this.userRepository.getById({ id: user_id, relations: ['roles'] });

      if (!user) {
        throw new apiError.NotFoundError({ details: [strings.userNotFound] });
      }

      const userRole = user?.roles.find((role) => role.name === Role.Employee);
      if (!userRole) {
        throw new apiError.ValidationError({ details: [strings.userNotEmployee] });
      }

      let client = await this.clientRepository.getById({ id: client_id });
      if (!client) {
        throw new apiError.NotFoundError({ details: [strings.clientNotFound] });
      }

      const userClientFound = await this.getSingleEntity({
        query: {
          client_id,
          user_id,
        },
      });

      if (userClientFound && userClientFound?.status === UserClientStatus.Inactive) {
        await this.changeStatusToInactive({
          user_id,
        });
        await this.repo.update({ client_id }, { status: UserClientStatus.Active });

        const userClient: any = await this.getSingleEntity({
          query: {
            client_id,
          },
        });
        return userClient;
      } else if (userClientFound && userClientFound?.status === UserClientStatus.Active) {
        return userClientFound;
      }
      await this.changeStatusToInactive({
        user_id,
      });
      const userClient = await this.repo.save({
        status: UserClientStatus.Active,
        client_id,
        user_id,
      });

      return userClient;
    } catch (err) {
      throw err;
    }
  };

  changeStatusToInactive = async (args: IUserClientMakeInactive): Promise<User> => {
    try {
      const user_id = args.user_id;

      let user = await this.userRepository.getById({ id: user_id, relations: ['roles'] });

      if (!user) {
        throw new apiError.NotFoundError({ details: [strings.userNotFound] });
      }

      await this.repo.update({ user_id }, { status: UserClientStatus.Inactive });

      return user;
    } catch (err) {
      throw err;
    }
  };
}
