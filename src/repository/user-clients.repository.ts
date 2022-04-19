import { inject, injectable } from 'inversify';
import { getRepository } from 'typeorm';
import BaseRepository from './base.repository';

import UserClient from '../entities/user-client.entity';
import { IUserClientCreate, IUserClientRepository, IUserIdQuery } from '../interfaces/user-client.interface';
import { IUserRepository } from '../interfaces/user.interface';
import { TYPES } from '../types';
import { Role, UserClientStatus } from '../config/constants';
import { ConflictError, ValidationError } from '../utils/api-error';
import strings from '../config/strings';

@injectable()
export default class UserClientRepository extends BaseRepository<UserClient> implements IUserClientRepository {
  private userRepository: IUserRepository;
  constructor(@inject(TYPES.UserRepository) _userRepository: IUserRepository) {
    super(getRepository(UserClient));
    this.userRepository = _userRepository;
  }

  create = async (args: IUserClientCreate): Promise<UserClient> => {
    try {
      const client_id = args.client_id;
      const user_id = args.user_id;

      let user = await this.userRepository.getById({ id: user_id, relations: ['roles'] });
      const userRole = user?.roles.find((role) => role.name === Role.Employee);

      if (!userRole) {
        throw new ValidationError({ details: [strings.userNotEmployee] });
      }
      let client = await this.userRepository.getById({
        id: client_id,
        relations: ['roles'],
      });

      const clientRole = client?.roles.find((e) => e.name === Role.Client);

      if (!clientRole) {
        throw new ValidationError({ details: [strings.userNotClient] });
      }

      let activeUser = await this.getAll({
        query: {
          user_id: user_id,
          status: UserClientStatus.Active,
        },
      });

      if (activeUser.length > 0) {
        throw new ConflictError({ details: [strings.userStatusActive] });
      }

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

  async getByUserId(args: IUserIdQuery): Promise<UserClient | undefined> {
    try {
      const userClient = await this.repo.findOne({
        where: {
          user_id: args.user_id,
        },
        relations: args?.relations ?? [],
      });
      return userClient;
    } catch (err) {
      throw err;
    }
  }
}
