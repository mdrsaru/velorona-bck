import { injectable } from 'inversify';
import find from 'lodash/find';

import { IUserRepository } from '../../interfaces/user.interface';

import config from '../../config/constants';
import strings from '../../config/strings';
import User from '../../entities/user.entity';
import { IEntityID, IEntityRemove } from '../../interfaces/common.interface';
import {
  IUser,
  IUserCreate,
  IUserUpdate,
  IEmailQuery,
  IEmailClientQuery,
} from '../../interfaces/user.interface';
import {
  IPaginationData,
  IPagingArgs,
  IGetAllAndCountResult,
} from '../../interfaces/paging.interface';
import { users } from './data';
import Paging from '../../utils/paging';
import { ConflictError, NotFoundError } from '../../utils/api-error';

function generateUuid() {
  var dt = new Date().getTime();
  var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
    /[xy]/g,
    function (c) {
      var r = (dt + Math.random() * 16) % 16 | 0;
      dt = Math.floor(dt / 16);
      return (c == 'x' ? r : (r & 0x3) | 0x8).toString(16);
    }
  );
  return uuid;
}

const date = '2022-03-08T08:01:04.776Z';

@injectable()
export default class UserRepository implements IUserRepository {
  getAllAndCount = (
    args: IPagingArgs
  ): Promise<IGetAllAndCountResult<User>> => {
    return Promise.resolve({
      count: users.length,
      rows: users as User[],
    });
  };

  getAll = (args: any): Promise<User[]> => {
    throw new Error('not implemented');
  };

  getById = (args: IEntityID): Promise<User | undefined> => {
    throw new Error('not implemented');
  };

  create = (args: IUserCreate): Promise<User> => {
    try {
      if (find(users, { email: args.email })) {
        throw new ConflictError({
          details: [strings.userAlreadyExists],
        });
      }

      const user = new User();

      user.id = generateUuid();
      user.email = args.email;
      user.firstName = args.firstName;
      user.phone = args.phone;
      user.lastName = args.lastName;
      user.status = args.status;
      user.createdAt = new Date();
      user.updatedAt = new Date();

      users.push(user);

      return Promise.resolve(user);
    } catch (err) {
      throw err;
    }
  };

  update = (args: IUserUpdate): Promise<User> => {
    try {
      const user = find(users, { id: args.id });
      if (!user) {
        throw new NotFoundError({
          details: [strings.userAlreadyExists],
        });
      }

      user.firstName = args.firstName;
      user.lastName = args.lastName;
      user.status = args.status;

      return Promise.resolve(user as User);
    } catch (err) {
      throw err;
    }
  };

  remove = (args: IEntityRemove): Promise<User> => {
    throw new Error('not implemented');
  };

  getByEmailAndNoClient = (args: IEmailQuery): Promise<User | undefined> => {
    throw new Error('not implemented');
  };

  getByEmailAndClientCode = (
    args: IEmailClientQuery
  ): Promise<User | undefined> => {
    throw new Error('not implemented');
  };
}
