import { injectable } from 'inversify';
import find from 'lodash/find';
import cloneDeep from 'lodash/cloneDeep';

import { IUserRepository } from '../../interfaces/user.interface';

import config from '../../config/constants';
import strings from '../../config/strings';
import { generateUuid } from './utils';
import { users, address } from './data';
import User from '../../entities/user.entity';
import Address from '../../entities/address.entity';
import Paging from '../../utils/paging';
import { ConflictError, NotFoundError } from '../../utils/api-error';

import { IEntityID, IEntityRemove, ISingleEntityQuery } from '../../interfaces/common.interface';
import { IUser, IUserCreate, IUserUpdate, IEmailQuery, IEmailCompanyQuery } from '../../interfaces/user.interface';
import { IPaginationData, IPagingArgs, IGetAllAndCountResult, IGetOptions } from '../../interfaces/paging.interface';

const date = '2022-03-08T08:01:04.776Z';

@injectable()
export default class UserRepository implements IUserRepository {
  users = cloneDeep(users);
  address = cloneDeep(address);

  getAllAndCount = (args: IPagingArgs): Promise<IGetAllAndCountResult<User>> => {
    return Promise.resolve({
      count: this.users.length,
      rows: this.users as User[],
    });
  };

  getAll = (args: any): Promise<User[]> => {
    throw new Error('not implemented');
  };

  async getSingleEntity(args: ISingleEntityQuery): Promise<User | undefined> {
    throw new Error('not implemented');
  }

  getById = (args: IEntityID): Promise<User | undefined> => {
    throw new Error('not implemented');
  };

  create = (args: IUserCreate): Promise<User> => {
    try {
      if (find(this.users, { email: args.email })) {
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
      user.password = 'password';
      const _address = args?.address;

      if (_address) {
        const address = new Address();
        address.id = generateUuid();
        address.aptOrSuite = _address.aptOrSuite ?? '';
        address.city = _address.city;
        address.state = _address.state;
        address.streetAddress = _address.streetAddress;
        address.zipcode = _address.zipcode;

        user.address = address;
      }

      this.users.push(user);

      return Promise.resolve(user);
    } catch (err) {
      throw err;
    }
  };

  update = (args: IUserUpdate): Promise<User> => {
    try {
      const user = find(this.users, { id: args.id });
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

  getByEmailAndNoCompany = (args: IEmailQuery): Promise<User | undefined> => {
    throw new Error('not implemented');
  };

  getByEmailAndCompanyCode = (args: IEmailCompanyQuery): Promise<User | undefined> => {
    throw new Error('not implemented');
  };

  countEntities(args: IGetOptions): Promise<number> {
    throw new Error('Not implemented');
  }
}
