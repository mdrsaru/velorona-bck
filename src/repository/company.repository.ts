import merge from 'lodash/merge';
import { injectable, inject } from 'inversify';
import { getRepository, Repository } from 'typeorm';
import crypto from 'crypto';

import { TYPES } from '../types';
import strings from '../config/strings';
import Company from '../entities/company.entity';
import BaseRepository from './base.repository';
import { ConflictError, NotFoundError } from '../utils/api-error';

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
      const name = args.name?.trim();
      const status = args.status;
      const isArchived = args?.isArchived ?? false;

      let companyName = name.substr(0, 5)?.toLowerCase();
      const length = 10 - companyName.length;
      const randomNumber = crypto.randomBytes(length).toString('hex').slice(0, length);

      const companyCode: string = companyName + randomNumber;
      const found = await this.repo.find({ companyCode });

      if (found.length) {
        throw new ConflictError({ details: [strings.companyCodeExists] });
      }

      const company = await this.repo.save({
        name,
        status,
        companyCode,
        isArchived,
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
      const isArchived = args?.isArchived;

      const found = await this.getById({ id });

      if (!found) {
        throw new NotFoundError({
          details: ['Company not found'],
        });
      }

      const update = merge(found, {
        id,
        name,
        status,
        isArchived,
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
