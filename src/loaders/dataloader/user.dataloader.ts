import { injectable, inject } from 'inversify';

import Dataloader from 'dataloader';

import { TYPES } from '../../types';
import container from '../../inversify.config';
import User from '../../entities/user.entity';
import Role from '../../entities/role.entity';
import { IUserRepository } from '../../interfaces/user.interface';
import { IMediaRepository } from '../../interfaces/media.interface';

const batchUsersByCompanyIdFn = async (ids: readonly string[]) => {
  const userRepo: IUserRepository = container.get(TYPES.UserRepository);
  const query = { company_id: ids };
  const users = await userRepo.getAll({ query });

  const userObj: { [companyId: string]: User[] } = {};

  users.forEach((user: User) => {
    if (user.company_id in userObj) {
      userObj[user.company_id].push(user);
    } else {
      userObj[user.company_id] = [user];
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

const batchUsersByIdFn = async (ids: readonly string[]) => {
  const userRepo: IUserRepository = container.get(TYPES.UserRepository);
  const query = { id: ids };
  const users: User[] = await userRepo.getAll({ query });
  const userObj: any = {};

  users.forEach((user: User) => {
    userObj[user.id] = user;
  });

  return ids.map((id) => userObj[id]);
};

const batchUsersByEmailFn = async (emails: readonly string[]) => {
  const userRepo: IUserRepository = container.get(TYPES.UserRepository);
  const query = { email: emails };
  const users: User[] = await userRepo.getAll({ query });
  const userObj: any = {};

  users.forEach((user: User) => {
    userObj[user.email] = user;
  });

  return emails.map((email) => userObj[email]);
};

export const usersByCompanyIdLoader = () => new Dataloader(batchUsersByCompanyIdFn);
export const rolesByUserIdLoader = () => new Dataloader(batchRolesByUserIdFn);
export const avatarByIdLoader = () => new Dataloader(batchAvatarsByIdFn);
export const usersByIdLoader = () => new Dataloader(batchUsersByIdFn);
export const usersByEmailLoader = () => new Dataloader(batchUsersByEmailFn);
