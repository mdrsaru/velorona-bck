import merge from 'lodash/merge';
import isString from 'lodash/isString';
import isNil from 'lodash/isNil';
import { injectable, inject } from 'inversify';
import { getRepository, Repository, getManager, EntityManager, In, ILike } from 'typeorm';
import crypto from 'crypto';

import { TYPES } from '../types';
import constants, { UserStatus, Role as RoleEnum, entities } from '../config/constants';
import strings from '../config/strings';
import Company, { CompanyGrowthOutput } from '../entities/company.entity';
import User from '../entities/user.entity';
import BaseRepository from './base.repository';
import * as apiError from '../utils/api-error';
import { generateRandomStrings } from '../utils/strings';

import {
  ICompany,
  ICompanyCreate,
  ICompanyUpdate,
  ICompanyRepository,
  ICompanyCodeInput,
} from '../interfaces/company.interface';
import { IHashService } from '../interfaces/common.interface';
import { IRoleRepository } from '../interfaces/role.interface';
import company from '../config/inversify/company';
import { IGetAllAndCountResult, IGetOptions } from '../interfaces/paging.interface';
import { isArray } from 'lodash';

@injectable()
export default class CompanyRepository extends BaseRepository<Company> implements ICompanyRepository {
  private manager: EntityManager;
  private hashService: IHashService;
  private roleRepository: IRoleRepository;

  constructor(
    @inject(TYPES.HashService) _hashService: IHashService,
    @inject(TYPES.RoleRepository) _roleRepository: IRoleRepository
  ) {
    super(getRepository(Company));
    this.hashService = _hashService;
    this.manager = getManager();
    this.roleRepository = _roleRepository;
  }

  companyGrowth = async (args?: any): Promise<CompanyGrowthOutput[]> => {
    let queryResult;

    queryResult = await this.manager.query(
      `SELECT count(*),date_trunc('month', created_at) as "createdAt"
        FROM companies AS p
       group by date_trunc('month', created_at) 
       order by date_trunc('month', created_at) 
      `
    );
    return queryResult;
  };

  getAllAndCount = async (args: IGetOptions): Promise<IGetAllAndCountResult<Company>> => {
    try {
      let { query = {}, select = [], relations = [], ...rest } = args;
      let { role: roleName, search, ...where } = query;
      const _select = select as (keyof Company)[];

      for (let key in query) {
        if (isArray(query[key])) {
          query[key] = In(query[key]);
        }
      }

      let _searchWhere: any = [];

      if (search) {
        _searchWhere = [
          {
            name: ILike(`%${search}`),
            ...where,
          },
        ];
      }

      let [rows, count] = await this.repo.findAndCount({
        relations,
        where: _searchWhere.length ? _searchWhere : where,
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

  create = async (args: ICompanyCreate): Promise<{ company: Company; user: User }> => {
    try {
      const name = args.name?.trim()?.replace(/\s+/g, ' ');
      const status = args.status;
      const archived = args?.archived ?? false;
      const email = args.user.email;
      const logo_id = args?.logo_id;
      const plan = args?.plan;

      const errors: string[] = [];

      if (isNil(name) || !isString(name)) {
        errors.push(strings.nameRequired);
      }
      if (isNil(email) || !isString(email)) {
        errors.push(strings.emailRequired);
      }

      if (errors.length) {
        throw new apiError.ValidationError({
          details: errors,
        });
      }

      let companyName = name
        ?.replace(/[^a-zA-Z0-9 ]/g, '')
        ?.replace(/\s+/g, '')
        ?.toLowerCase()
        ?.substr(0, 6);

      const remainingLength = 10 - companyName?.length ?? 0;
      const randomNumber = crypto.randomBytes(10).toString('hex').slice(0, remainingLength);

      const companyCode: string = companyName + randomNumber;
      const found = await this.repo.find({ companyCode });

      if (found.length) {
        throw new apiError.ConflictError({ details: [strings.companyCodeExists] });
      }

      let result = await this.manager.transaction(async (entityManager) => {
        const companyRepo = entityManager.getRepository(Company);
        const userRepo = entityManager.getRepository(User);

        const company = await companyRepo.save({
          name,
          status,
          companyCode,
          archived,
          adminEmail: email,
          logo_id,
          plan,
        });

        //const password = generateRandomStrings({ length: 8 });
        const password = args.user.password as string;
        const hashedPassword = await this.hashService.hash(password, constants.saltRounds);

        const roles = await this.roleRepository.getAll({
          query: {
            name: RoleEnum.CompanyAdmin,
          },
        });

        if (!roles.length) {
          throw new apiError.NotFoundError({
            details: [strings.companyRoleNotFound],
          });
        }

        const userInput: any = {
          email,
          password: hashedPassword,
          firstName: args.user?.firstName,
          lastName: args.user?.lastName,
          middleName: args.user?.middleName,
          phone: args.user?.phone,
          company_id: company.id,
          roles,
        };

        if (args.user?.address) {
          userInput.address = args.user.address;
        }

        const user: any = await userRepo.save(userInput);

        return {
          company,
          user,
        };
      });

      return result;
    } catch (err) {
      throw err;
    }
  };

  update = async (args: ICompanyUpdate): Promise<Company> => {
    try {
      const id = args.id;
      const name = args.name;
      const status = args.status;
      const archived = args?.archived;
      const logo_id = args?.logo_id;
      const plan = args?.plan;
      const stripeCustomerId = args?.stripeCustomerId;
      const subscriptionId = args?.subscriptionId;
      const subscriptionItemId = args?.subscriptionItemId;
      const subscriptionStatus = args?.subscriptionStatus;
      const user = args.user;
      const trialEnded = args.trialEnded;
      const subscriptionPeriodEnd = args.subscriptionPeriodEnd;
      const trialEndDate = args.trialEndDate;

      const found = await this.getById({ id });

      if (!found) {
        throw new apiError.NotFoundError({
          details: ['Company not found'],
        });
      }

      const update = merge(found, {
        id,
        name,
        status,
        archived,
        logo_id,
        plan,
        subscriptionId,
        stripeCustomerId,
        subscriptionItemId,
        subscriptionStatus,
        trialEnded,
        subscriptionPeriodEnd,
        trialEndDate,
      });

      const company = await this.repo.save(update);

      return company;
    } catch (err) {
      throw err;
    }
  };

  getByCompanyCode = async (args: ICompanyCodeInput): Promise<Company | undefined> => {
    try {
      const companyCode = args.companyCode;
      const company = await this.repo.findOne({ companyCode });
      return company;
    } catch (err) {
      throw err;
    }
  };
}
