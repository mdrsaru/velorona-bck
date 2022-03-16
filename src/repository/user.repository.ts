import merge from 'lodash/merge';

import isNil from 'lodash/isNil';
import isString from 'lodash/isString';
import isArray from 'lodash/isArray';
import { injectable, inject } from 'inversify';
import { getRepository } from 'typeorm';

import { TYPES } from '../types';
import strings from '../config/strings';
import config from '../config/constants';
import User from '../entities/user.entity';
import BaseRepository from './base.repository';
import * as apiError from '../utils/api-error';

import { IHashService } from '../interfaces/common.interface';
import { IUser, IUserCreate, IUserUpdate, IUserRepository } from '../interfaces/user.interface';
import { IRoleRepository } from '../interfaces/role.interface';

@injectable()
export default class UserRepository extends BaseRepository<User> implements IUserRepository {
  private hashService: IHashService;
  private roleRepository: IRoleRepository;

  constructor(
    @inject(TYPES.HashService) _hashService: IHashService,
    @inject(TYPES.RoleRepository) _roleRepository: IRoleRepository
  ) {
    super(getRepository(User));
    this.hashService = _hashService;
    this.roleRepository = _roleRepository;
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
      const roles = args.roles;
      const record = args.record;
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
      if (isNil(roles) || !isArray(roles) || !roles.length) {
        errors.push(strings.rolesRequired);
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

      const existingRoles = await this.roleRepository.getAll({
        query: {
          id: roles,
        },
      });

      if (existingRoles?.length !== roles.length) {
        throw new apiError.ValidationError({
          details: [strings.userCreateRoleNotFound],
        });
      }

      const hashedPassword = await this.hashService.hash(password, config.saltRounds);

      const user = await this.repo.save({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        middleName,
        status,
        phone,
        client_id,
        address,
        roles: existingRoles,
        record,
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
      const password = args?.password;
      const record = args?.record;

      const found = await this.repo.findOne(id, { relations: ['address', 'record'] });

      if (!found) {
        throw new apiError.NotFoundError({
          details: [strings.userNotFound],
        });
      }
      let hashedPassword;
      if (password) {
        hashedPassword = await this.hashService.hash(password, config.saltRounds);
      }
      const update = merge(found, {
        id,
        firstName,
        lastName,
        middleName,
        status,
        phone,
        address: {
          ...(found.address ?? {}),
          ...address,
        },
        password: hashedPassword,
        record,
      });

      const user = await this.repo.save(update);

      return user;
    } catch (err) {
      throw err;
    }
  };

  getByEmail = async (args: any = {}): Promise<User | undefined> => {
    try {
      const user = await this.repo.findOne(
        {
          email: args.email,
        },
        {
          relations: args?.relations ?? [],
        }
      );

      return user;
    } catch (err) {
      throw err;
    }
  };
}
