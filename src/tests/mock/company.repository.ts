import { injectable } from 'inversify';
import findIndex from 'lodash/findIndex';
import find from 'lodash/find';
import merge from 'lodash/merge';
import cloneDeep from 'lodash/cloneDeep';

import { ICompanyRepository } from '../../interfaces/company.interface';

import config from '../../config/constants';
import strings from '../../config/strings';
import { generateUuid } from './utils';
import { companies } from '../mock/data';
import Paging from '../../utils/paging';
import Company from '../../entities/company.entity';
import User from '../../entities/user.entity';
import * as apiError from '../../utils/api-error';

import { IEntityID, IEntityRemove } from '../../interfaces/common.interface';
import { ICompany, ICompanyCreate, ICompanyUpdate, ICompanyCodeInput } from '../../interfaces/company.interface';
import { IPaginationData, IPagingArgs, IGetAllAndCountResult } from '../../interfaces/paging.interface';

const date = '2022-03-08T08:01:04.776Z';

@injectable()
export default class CompanyRepository implements ICompanyRepository {
  public companies = cloneDeep(companies);

  getAllAndCount = (args: IPagingArgs): Promise<IGetAllAndCountResult<Company>> => {
    return Promise.resolve({
      count: this.companies.length,
      rows: this.companies as Company[],
    });
  };

  getAll = (args: any): Promise<Company[]> => {
    throw new Error('not implemented');
  };

  getById = (args: IEntityID): Promise<Company | undefined> => {
    throw new Error('not implemented');
  };

  create = (args: ICompanyCreate): Promise<{ company: Company; user: User }> => {
    try {
      const company = new Company();

      company.id = generateUuid();
      company.name = args.name;
      company.companyCode = args.name + 'random';
      company.status = company.status;
      company.archived = company.archived;
      company.createdAt = company.createdAt;
      company.updatedAt = company.updatedAt;

      const user = new User();

      this.companies.push(company);

      return Promise.resolve({
        company,
        user: user,
      });
    } catch (err) {
      throw err;
    }
  };

  update = (args: ICompanyUpdate): Promise<Company> => {
    try {
      const id = args.id;

      const foundIndex = findIndex(this.companies, { id });

      if (foundIndex < 0) {
        throw new apiError.NotFoundError({
          details: [strings.companyNotFound],
        });
      }

      const update = merge(this.companies[foundIndex], {
        name: args.name,
        status: args.status,
        archived: args.archived,
      });

      this.companies[foundIndex] = update;

      return Promise.resolve(update);
    } catch (err) {
      throw err;
    }
  };

  remove = (args: IEntityRemove): Promise<Company> => {
    throw new Error('not implemented');
  };

  getByCompanyCode = (args: ICompanyCodeInput): Promise<Company | undefined> => {
    const found = find(this.companies, { companyCode: args.companyCode });
    return found;
  };
}
