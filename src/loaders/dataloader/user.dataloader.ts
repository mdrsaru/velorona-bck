import { injectable, inject } from 'inversify';

import Dataloader from 'dataloader';

import { TYPES } from '../../types';
import container from '../../inversify.config';
import User from '../../entities/user.entity';
import { IUserRepository } from '../../interfaces/user.interface';

const batchUsersByClientIdFn = async (ids: readonly string[]) => {
  const userRepo: IUserRepository = container.get(TYPES.UserRepository);
  const query = { client_id: ids };
  const users = await userRepo.getAll({ query });

  const userObj: { [clientId: string]: User[] } = {};

  users.forEach((user: User) => {
    if (user.client_id in userObj) {
      userObj[user.client_id].push(user);
    } else {
      userObj[user.client_id] = [user];
    }
  });

  return ids.map((id) => userObj[id] ?? []);
};

export const usersByClientIdLoader = () => new Dataloader(batchUsersByClientIdFn);
