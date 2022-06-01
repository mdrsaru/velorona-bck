import { injectable } from 'inversify';
import find from 'lodash/find';
import cloneDeep from 'lodash/cloneDeep';

import { userPayRates } from './data';
import strings from '../../config/strings';
import UserPayRate from '../../entities/user-payrate.entity';
import { NotFoundError } from '../../utils/api-error';
import { generateUuid } from './utils';

import { IEntityID, IEntityRemove, ISingleEntityQuery } from '../../interfaces/common.interface';
import { IGetAllAndCountResult, IPagingArgs } from '../../interfaces/paging.interface';
import {
  IUserPayRateCreateInput,
  IUserPayRateRepository,
  IUserPayRateUpdateInput,
} from '../../interfaces/user-payrate.interface';

const date = '2022-03-08T08:01:04.776Z';

@injectable()
export default class UserPayRateRepository implements IUserPayRateRepository {
  userPayRates = cloneDeep(userPayRates);
  getAllAndCount = (args: IPagingArgs): Promise<IGetAllAndCountResult<UserPayRate>> => {
    return Promise.resolve({
      count: this.userPayRates.length,
      rows: this.userPayRates as UserPayRate[],
    });
  };

  getAll = (args: any): Promise<UserPayRate[]> => {
    throw new Error('not implemented');
  };

  async getSingleEntity(args: ISingleEntityQuery): Promise<UserPayRate | undefined> {
    throw new Error('not implemented');
  }

  getById = (args: IEntityID): Promise<UserPayRate | undefined> => {
    throw new Error('not implemented');
  };

  create = (args: IUserPayRateCreateInput): Promise<UserPayRate> => {
    try {
      const userPayRate = new UserPayRate();

      userPayRate.id = generateUuid();
      userPayRate.startDate = args.startDate ?? new Date();
      userPayRate.endDate = args.endDate ?? new Date();
      userPayRate.amount = args.amount;
      userPayRate.user_id = args.user_id;
      userPayRate.project_id = args.project_id;
      userPayRate.createdAt = new Date();
      userPayRate.updatedAt = new Date();

      this.userPayRates.push(userPayRate);

      return Promise.resolve(userPayRate);
    } catch (err) {
      throw err;
    }
  };

  update = (args: IUserPayRateUpdateInput): Promise<UserPayRate> => {
    try {
      const userPayRate = find(this.userPayRates, { id: args.id });
      if (!userPayRate) {
        throw new NotFoundError({
          details: [strings.userPayRateNotFound],
        });
      }

      userPayRate.startDate = args.startDate;
      userPayRate.endDate = args.endDate;
      userPayRate.amount = args.amount;
      userPayRate.user_id = args.user_id;
      userPayRate.project_id = args.project_id;

      return Promise.resolve(userPayRate as UserPayRate);
    } catch (err) {
      throw err;
    }
  };

  remove = (args: IEntityRemove): Promise<UserPayRate> => {
    throw new Error('not implemented');
  };
}
