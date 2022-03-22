import { injectable, inject } from 'inversify';

import Dataloader from 'dataloader';

import { TYPES } from '../../types';
import container from '../../inversify.config';
import User from '../../entities/user.entity';
import Role from '../../entities/role.entity';
import { IUserRepository } from '../../interfaces/user.interface';
import { IMediaRepository } from '../../interfaces/media.interface';

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

const batchRolesByUserIdFn = async (ids: readonly string[]) => {
  const userRepo: IUserRepository = container.get(TYPES.UserRepository);
  const query = { id: ids };
  const users = await userRepo.getAll({ query, relations: ['roles'] });

  const roleObj: { [userId: string]: Role[] } = {};

  users.forEach((user: User) => {
    roleObj[user.id] = user.roles ?? [];
  });

  return ids.map((userId: string) => roleObj[userId] ?? []);
};

const batchAvatarsByIdFn = async (ids: readonly string[]) => {
  const mediaRepo: IMediaRepository = container.get(TYPES.MediaRepository);
  const query = { id: ids };
  const media = await mediaRepo.getAll({ query });
  const mediaObj: any = {};

  media.forEach((media: any) => {
    mediaObj[media.id] = media;
  });

  return ids.map((id) => mediaObj[id]);
};

export const usersByClientIdLoader = () => new Dataloader(batchUsersByClientIdFn);
export const rolesByUserIdLoader = () => new Dataloader(batchRolesByUserIdFn);
export const avatarByIdLoader = () => new Dataloader(batchAvatarsByIdFn);
