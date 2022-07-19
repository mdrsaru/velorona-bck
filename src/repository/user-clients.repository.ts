import { inject, injectable } from 'inversify';
import { getRepository, In } from 'typeorm';
import BaseRepository from './base.repository';

import { TYPES } from '../types';
import strings from '../config/strings';
import User from '../entities/user.entity';
import UserClient from '../entities/user-client.entity';
import { Role, UserClientStatus } from '../config/constants';
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

  constructor(
    @inject(TYPES.UserRepository) _userRepository: IUserRepository,
    @inject(TYPES.ClientRepository) _clientRepository: IClientRepository
  ) {
    super(getRepository(UserClient));
    this.userRepository = _userRepository;
    this.clientRepository = _clientRepository;
  }

  getAllAndCount = async (args: IGetOptions): Promise<IGetAllAndCountResult<UserClient>> => {
    try {
      let { query = {}, select = [], relations = [], ...rest } = args;
      let { search, ...where } = query;
      const _select = select as (keyof UserClient)[];

      for (let key in query) {
        if (isArray(query[key])) {
          query[key] = In(query[key]);
        }
      }

      let [rows, count] = await this.repo.findAndCount({
        relations: ['client'],
        where: where,
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
