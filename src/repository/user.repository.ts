import merge from 'lodash/merge';
import isDate from 'lodash/isDate';
import isNil from 'lodash/isNil';
import isString from 'lodash/isString';
import isArray from 'lodash/isArray';
import { injectable, inject } from 'inversify';
import { getRepository, In, IsNull, Like, ILike, SelectQueryBuilder, Raw } from 'typeorm';

import { TYPES } from '../types';
import strings from '../config/strings';
import config from '../config/constants';
import User from '../entities/user.entity';
import Role from '../entities/role.entity';
import BaseRepository from './base.repository';
import * as apiError from '../utils/api-error';

import { IHashService } from '../interfaces/common.interface';
import {
  IUser,
  IUserCreateRepo,
  IUserUpdate,
  IUserRepository,
  IEmailQuery,
  IEmailCompanyQuery,
} from '../interfaces/user.interface';
import { IRoleRepository } from '../interfaces/role.interface';
import { ICompanyRepository } from '../interfaces/company.interface';
import { IGetAllAndCountResult, IGetOptions } from '../interfaces/paging.interface';

@injectable()
export default class UserRepository extends BaseRepository<User> implements IUserRepository {
  private hashService: IHashService;
  private roleRepository: IRoleRepository;
  private companyRepository: ICompanyRepository;

  constructor(
    @inject(TYPES.HashService) _hashService: IHashService,
    @inject(TYPES.RoleRepository) _roleRepository: IRoleRepository,
    @inject(TYPES.CompanyRepository) _companyRepository: ICompanyRepository
  ) {
    super(getRepository(User));
    this.hashService = _hashService;
    this.roleRepository = _roleRepository;
    this.companyRepository = _companyRepository;
  }

  getAllAndCount = async (args: IGetOptions): Promise<IGetAllAndCountResult<User>> => {
    try {
      let { query = {}, relations = [], ...rest } = args;
      let { role: roleName, search, ...where } = query;

      for (let key in query) {
        if (isArray(query[key])) {
          query[key] = In(query[key]);
        }
      }

      let _searchWhere: any = [];

      if (search) {
        _searchWhere = [
          {
            firstName: ILike(`%${search}`),
            ...where,
          },
          {
            email: ILike(`%${search}`),
            ...where,
          },
        ];
      }

      let role: Role | undefined;
      if (roleName) {
        relations.push('roles');
        role = await this.roleRepository.getSingleEntity({ query: { name: roleName } });
      }

      // Using function based where query since it needs inner join where clause
      const _where = (qb: SelectQueryBuilder<User>) => {
        const a = qb.where(_searchWhere.length ? _searchWhere : where);

        if (roleName) {
          a.andWhere('role_id = :roleId', { roleId: role?.id ?? '' });
        }
      };

      let [rows, count] = await this.repo.findAndCount({
        relations,
        where: _where,
        ...rest,
      });

      return {
        count,
        rows,
      };
    } catch (err) {
      throw err;
    }
  };

  create = async (args: IUserCreateRepo): Promise<User> => {
    try {
      const email = args.email?.toLowerCase()?.trim();
      const password = args.password;
      const phone = args.phone;
      const firstName = args.firstName;
      const lastName = args.lastName;
      const middleName = args.middleName;
      const status = args.status;
      const company_id = args.company_id;
      const address = args?.address;
      const roles = args.roles;
      const archived = args?.archived ?? false;

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

      if (errors.length) {
        throw new apiError.ValidationError({
          details: errors,
        });
      }

      let found;
      if (company_id) {
        // Get users related to companys
        found = await this.repo.findOne({ where: { email, company_id } });
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
          name: roles,
        },
      });
      if (!existingRoles?.length) {
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
        company_id,
        address,
        roles: existingRoles,
        archived,
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
      const address = args?.address ?? {};
      const password = args?.password;
      const avatar_id = args?.avatar_id;
      const archived = args?.archived;

      const found = await this.repo.findOne(id, {
        relations: ['address'],
      });

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
        avatar_id,
        password: hashedPassword,
        address: {
          ...(found.address ?? {}),
          ...address,
        },
        archived,
      });

      const user = await this.repo.save(update);

      return user;
    } catch (err) {
      throw err;
    }
  };

  getByEmailAndNoCompany = async (args: IEmailQuery): Promise<User | undefined> => {
    try {
      const user = await this.repo.findOne({
        where: {
          email: args.email,
          company_id: IsNull(),
        },
        relations: args?.relations ?? [],
      });

      return user;
    } catch (err) {
      throw err;
    }
  };

  getByEmailAndCompanyCode = async (args: IEmailCompanyQuery): Promise<User | undefined> => {
    try {
      const companyCode = args.companyCode;
      const email = args.email;

      const company = await this.companyRepository.getByCompanyCode({
        companyCode,
      });
      if (!company) {
        throw new apiError.NotFoundError({
          details: [strings.companyNotFound],
        });
      }

      const user = await this.repo.findOne(
        {
          email,
          company_id: company.id,
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
