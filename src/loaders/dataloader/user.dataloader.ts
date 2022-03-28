import { injectable, inject } from 'inversify';

import Dataloader from 'dataloader';

import { TYPES } from '../../types';
import container from '../../inversify.config';
import User from '../../entities/user.entity';
import Role from '../../entities/role.entity';
import { IUserRepository } from '../../interfaces/user.interface';
import { IMediaRepository } from '../../interfaces/media.interface';
import { IAddressRepository } from '../../interfaces/address.interface';
import { IUserRecordRepository } from '../../interfaces/user-record.interface';

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

const batchAddressByUserIdFn = async (ids: readonly string[]) => {
  const addressRepo: IAddressRepository = container.get(
    TYPES.AddressRepository
  );
  const query = { user_id: ids };
  const address = await addressRepo.getAll({ query });
  const addressObj: any = {};

  address.forEach((address: any) => {
    addressObj[address.user_id] = address;
  });
  return ids.map((id) => addressObj[id]);
};

const batchRecordByUserIdFn = async (ids: readonly string[]) => {
  const recordRepo: IUserRecordRepository = container.get(
    TYPES.UserRecordRepository
  );
  const query = { user_id: ids };
  const record = await recordRepo.getAll({ query });
  const recordObj: any = {};

  record.forEach((record: any) => {
    recordObj[record.user_id] = record;
  });
  return ids.map((id) => recordObj[id]);
};

export const usersByClientIdLoader = () =>
  new Dataloader(batchUsersByClientIdFn);
export const rolesByUserIdLoader = () => new Dataloader(batchRolesByUserIdFn);
export const avatarByIdLoader = () => new Dataloader(batchAvatarsByIdFn);
export const addressByUserIdLoader = () =>
  new Dataloader(batchAddressByUserIdFn);
export const recordByUserIdLoader = () => new Dataloader(batchRecordByUserIdFn);
