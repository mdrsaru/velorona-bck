import merge from 'lodash/merge';
import isDate from 'lodash/isDate';
import isNil from 'lodash/isNil';
import isString from 'lodash/isString';
import isArray from 'lodash/isArray';
import find from 'lodash/find';
import { injectable, inject } from 'inversify';
import { getRepository, In, IsNull, Like, ILike, SelectQueryBuilder, Raw } from 'typeorm';

import { TYPES } from '../types';
import strings from '../config/strings';
import User from '../entities/user.entity';
import Role from '../entities/role.entity';
import BaseRepository from './base.repository';
import * as apiError from '../utils/api-error';
import config, { entities, Role as RoleEnum } from '../config/constants';
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
      let { query = {}, select = [], relations = [], ...rest } = args;
      let { role: roleName, search, ...where } = query;
      const _select = select as (keyof User)[];

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
        const queryBuilder = qb.where(_searchWhere.length ? _searchWhere : where);

        if (roleName) {
          queryBuilder.andWhere('role_id = :roleId', { roleId: role?.id ?? '' });
        }
      };

      let [rows, count] = await this.repo.findAndCount({
        relations,
        where: _where,
        ...(_select?.length && { select: _select }),
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
      const entryType = args?.entryType;
      const startDate = args?.startDate;
      const endDate = args?.endDate;
      const timesheet_attachment = args?.timesheet_attachment;
      const manager_id = args.manager_id;

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

      if (manager_id) {
        const manager = await this.repo
          .createQueryBuilder(entities.users)
          .select(['users.id', 'roles.name'])
          .where({ id: manager_id })
          .innerJoin('users.roles', 'roles')
          .getOne();

        const isManager = find(manager?.roles ?? [], { name: RoleEnum.TaskManager });
        if (!manager || !isManager) {
          throw new apiError.NotFoundError({
            details: [strings.managerNotFound],
          });
        }
      }

      const hashedPassword = await this.hashService.hash(password, config.saltRounds);
      const userData: any = {
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
        startDate,
        endDate,
        timesheet_attachment,
        manager_id,
      };

      if (roles.includes(RoleEnum.Employee)) {
        userData.entryType = entryType;
      }

      const user = await this.repo.save(userData);

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
      const entryType = args?.entryType;
      const startDate = args?.startDate;
      const endDate = args?.endDate;
      const timesheet_attachment = args?.timesheet_attachment;
      const manager_id = args?.manager_id;
      const roles = args?.roles;

      const found = await this.repo.findOne(id, {
        relations: ['address', 'roles'],
      });

      if (!found) {
        throw new apiError.NotFoundError({
          details: [strings.userNotFound],
        });
      }

      const existingRoles = await this.roleRepository.getAll({
        query: {
          name: roles,
        },
      });

      if (manager_id) {
        const manager = await this.repo
          .createQueryBuilder(entities.users)
          .select(['users.id', 'roles.name'])
          .where({ id: manager_id })
          .innerJoin('users.roles', 'roles')
          .getOne();

        const isManager = find(manager?.roles ?? [], { name: RoleEnum.TaskManager });
        if (!manager || !isManager) {
          throw new apiError.NotFoundError({
            details: [strings.managerNotFound],
          });
        }
      }

      let hashedPassword;
      if (password) {
        hashedPassword = await this.hashService.hash(password, config.saltRounds);
      }
      console.log(startDate);
      const updateData: any = {
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
        startDate,
        endDate,
        timesheet_attachment,
        manager_id,
        roles: existingRoles,
      };

      const role = found?.roles.some(function (role) {
        return role.name === RoleEnum.Employee;
      });

      if (role) {
        updateData.entryType = entryType;
      }

      const update = merge(found, updateData);
      console.log(update, 'update \n\n\n');

      const user = await this.repo.save(update);
      console.log(user);
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

  countEntities = async (args: IGetOptions): Promise<number> => {
    let { query = {}, select = [], relations = [], ...rest } = args;
    let { role: roleName, search, ...where } = query;

    for (let key in query) {
      if (isArray(query[key])) {
        query[key] = In(query[key]);
      }
    }

    let role: Role | undefined;
    if (roleName) {
      relations.push('roles');
      role = await this.roleRepository.getSingleEntity({ query: { name: roleName } });
    }

    // Using function based where query since it needs inner join where clause
    const _where = (qb: SelectQueryBuilder<User>) => {
      const queryBuilder = qb.where(where);

      if (roleName) {
        queryBuilder.andWhere('role_id = :roleId', { roleId: role?.id ?? '' });
      }
    };

    return this.repo.count({
      relations,
      where: _where,
      ...rest,
    });
  };
}
