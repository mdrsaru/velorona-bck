import merge from 'lodash/merge';
import isString from 'lodash/isString';
import isNil from 'lodash/isNil';
import { injectable, inject } from 'inversify';
import { getRepository, Repository } from 'typeorm';
import crypto from 'crypto';

import { TYPES } from '../types';
import strings from '../config/strings';
import Company from '../entities/company.entity';
import BaseRepository from './base.repository';
import * as apiError from '../utils/api-error';

import {
  ICompany,
  ICompanyCreate,
  ICompanyUpdate,
  ICompanyRepository,
  ICompanyCodeInput,
} from '../interfaces/company.interface';

@injectable()
export default class CompanyRepository extends BaseRepository<Company> implements ICompanyRepository {
  constructor() {
    super(getRepository(Company));
  }

  create = async (args: ICompanyCreate): Promise<Company> => {
    try {
      const name = args.name?.trim()?.replace(/\s+/g, ' ');
      const status = args.status;
      const archived = args?.archived ?? false;

      const errors: string[] = [];

      if (isNil(name) || !isString(name)) {
        errors.push(strings.nameRequired);
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

      const company = await this.repo.save({
        name,
        status,
        companyCode,
        archived,
      });

      return company;
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
