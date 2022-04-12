import { injectable } from 'inversify';
import { getRepository } from 'typeorm';
import BaseRepository from './base.repository';

import UserClient from '../entities/user-client.entity';
import { IUserClientCreate, IUserClientRepository, IUserIdQuery } from '../interfaces/user-client.interface';
import { UserClientStatus } from '../config/constants';

@injectable()
export default class UserClientRepository extends BaseRepository<UserClient> implements IUserClientRepository {
  constructor() {
    super(getRepository(UserClient));
  }

  create = async (args: IUserClientCreate): Promise<UserClient> => {
    try {
      const client_id = args.client_id;
      const user_id = args.user_id;

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
