import merge from 'lodash/merge';
import isNil from 'lodash/isNil';
import isString from 'lodash/isString';
import { injectable } from 'inversify';
import { getRepository } from 'typeorm';

import strings from '../config/strings';
import User from '../entities/user.entity';
import Address from '../entities/address.entity';
import BaseRepository from './base.repository';
import { IUser, IUserCreate, IUserUpdate, IUserRepository } from '../interfaces/user.interface';
import * as apiError from '../utils/api-error';

@injectable()
export default class UserRepository extends BaseRepository<User> implements IUserRepository {
  constructor() {
    super(getRepository(User));
  }

  create = async (args: IUserCreate): Promise<User> => {
    try {
      const email = args.email;
      const password = args.password;
      const phone = args.phone;
      const firstName = args.firstName;
      const lastName = args.lastName;
      const middleName = args.middleName;
      const status = args.status;
      const client_id = args.client_id;
      const address = args?.address;

      const errors: string[] = [];

      if (isNil(email) || !isString(email)) {
        errors.push(strings.emailRequired);
      }
      if (isNil(password) || !isString(password)) {
        errors.push(strings.passwordRequired);
      }
      if (isNil(firstName) || !isString(firstName)) {
        errors.push(strings.firstNameRequired);
      }
      if (isNil(lastName) || !isString(lastName)) {
        errors.push(strings.lastNameRequired);
      }
      if (isNil(phone) || !isString(phone)) {
        errors.push(strings.phoneRequired);
      }

      let found;
      if (client_id) {
        // Get users related to clients
        found = await this.repo.findOne({ where: { email, client_id } });
      } else {
        // Super Admin
        found = await this.repo.findOne({ where: { email } });
      }

      if (found) {
        throw new apiError.ConflictError({
          details: [strings.userAlreadyExists],
        });
      }
      const user = await this.repo.save({
        email,
        password,
        firstName,
        lastName,
        middleName,
        status,
        phone,
        client_id,
        address,
      });

      return user;
    } catch (err) {
      throw err;
    }
  };

  update = async (args: IUserUpdate): Promise<User> => {
    try {
      const id = args.id;
      const firstName = args.firstName;
      const lastName = args.lastName;
      const middleName = args.middleName;
      const status = args.status;
      const phone = args.phone;
      const address = args?.address;

      const found = await this.repo.findOne(id, { relations: ['address'] });

      if (!found) {
        throw new apiError.NotFoundError({
          details: [strings.userNotFound],
        });
      }
      const _address = {
        id: found.address.id,
        ...address,
      };
      const update = merge(found, {
        id,
        firstName,
        lastName,
        middleName,
        status,
        phone,
        address: _address,
      });

      const user = await this.repo.save(update);
      return user;
    } catch (err) {
      throw err;
    }
  };
}
