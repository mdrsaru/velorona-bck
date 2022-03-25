import isDate from 'lodash/isDate';
import isNil from 'lodash/isNil';
import isString from 'lodash/isString';
import { injectable, inject } from 'inversify';
import { getRepository } from 'typeorm';

import { TYPES } from '../types';
import strings from '../config/strings';
import config from '../config/constants';
import UserToken from '../entities/user-token.entity';
import BaseRepository from './base.repository';
import * as apiError from '../utils/api-error';

import { IHashService } from '../interfaces/common.interface';
import {
  IUserToken,
  IUserTokenCreateRepo,
  IUserTokenRepository,
  IUserTokenDeleteByToken,
  IUserTokenDeleteByUserId,
} from '../interfaces/user-token.interface';
import { IRoleRepository } from '../interfaces/role.interface';

@injectable()
export default class UserTokenRepository
  extends BaseRepository<UserToken>
  implements IUserTokenRepository
{
  constructor() {
    super(getRepository(UserToken));
  }

  create = async (args: IUserTokenCreateRepo): Promise<UserToken> => {
    try {
      const tokenType = args.tokenType;
      const expiresIn = args.expiresIn;
      const user_id = args.user_id;
      const token = args.token;

      const errors: string[] = [];

      if (isNil(tokenType)) {
        errors.push(strings.tokenTypeRequired);
      }

      if (isNil(expiresIn) || !isDate(expiresIn)) {
        errors.push(strings.expiresInNotValid);
      }

      if (isNil(user_id) || !isString(user_id)) {
        errors.push(strings.userIdRequired);
      }

      if (isNil(user_id) || !isString(user_id)) {
        errors.push(strings.userIdRequired);
      }

      let found;

      const userToken = await this.repo.save({
        tokenType,
        expiresIn,
        user_id,
        token,
      });

      return userToken;
    } catch (err) {
      throw err;
    }
  };

  async getByToken(token: string): Promise<UserToken | undefined> {
    return this.repo.findOne({ where: { token } });
  }

  deleteByToken = async (
    args: IUserTokenDeleteByToken
  ): Promise<UserToken | undefined> => {
    try {
      const token = args.token;
      const found = await this.repo.findOne({ where: { token } });

      if (!found) {
        throw new apiError.NotFoundError({
          details: [strings.resourceNotFound],
        });
      }

      await this.repo.remove(found);

      return found;
    } catch (err) {
      throw err;
    }
  };

  deleteByUserId = async (args: IUserTokenDeleteByUserId): Promise<boolean> => {
    try {
      const user_id = args.user_id;

      await this.repo.delete({ user_id });

      return true;
    } catch (err) {
      throw err;
    }
  };
}
