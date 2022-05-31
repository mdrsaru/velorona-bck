import merge from 'lodash/merge';
import isString from 'lodash/isString';
import isNil from 'lodash/isNil';
import { injectable, inject } from 'inversify';
import { getRepository, Repository, getManager, EntityManager } from 'typeorm';
import crypto from 'crypto';

import { TYPES } from '../types';
import constants, { UserStatus, Role as RoleEnum } from '../config/constants';
import strings from '../config/strings';
import Company from '../entities/company.entity';
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

  create = async (args: ICompanyCreate): Promise<{ company: Company; user: User }> => {
    try {
      const name = args.name?.trim()?.replace(/\s+/g, ' ');
      const status = args.status;
      const archived = args?.archived ?? false;
      const email = args.user.email;

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
        });

        const password = generateRandomStrings({ length: 8 });
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

        const user: any = await userRepo.save({
          email,
          password: hashedPassword,
          firstName: args.user?.firstName,
          lastName: args.user?.lastName,
          middleName: args.user?.middleName,
          phone: args.user?.phone,
          company_id: company.id,
          roles,
        });

        if (args.user?.address) {
          user.address = args.user.address;
        }

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
