import { injectable, inject } from 'inversify';

import { events } from '../config/constants';
import Company from '../entities/company.entity';
import Paging from '../utils/paging';
import { TYPES } from '../types';
import userEmitter from '../subscribers/user.subscriber';
import { generateRandomStrings } from '../utils/strings';

import { IPagingArgs, IPaginationData } from '../interfaces/paging.interface';
import { IEntityRemove, IEntityID } from '../interfaces/common.interface';
import { ICompanyCreate, ICompanyUpdate, ICompanyRepository, ICompanyService } from '../interfaces/company.interface';

@injectable()
export default class CompanyService implements ICompanyService {
  private companyRepository: ICompanyRepository;

  constructor(@inject(TYPES.CompanyRepository) companyRepository: ICompanyRepository) {
    this.companyRepository = companyRepository;
  }

  getAllAndCount = async (args: IPagingArgs): Promise<IPaginationData<Company>> => {
    try {
      const { rows, count } = await this.companyRepository.getAllAndCount(args);

      const paging = Paging.getPagingResult({
        ...args,
        total: count,
      });

      return {
        paging,
        data: rows,
      };
    } catch (err) {
      throw err;
    }
  };

  create = async (args: ICompanyCreate): Promise<Company> => {
    try {
      const name = args.name;
      const status = args.status;
      const archived = args?.archived;
      const user = args.user;

      const password = generateRandomStrings({ length: 8 });
      user.password = password;

      const result = await this.companyRepository.create({
        name,
        status,
        archived,
        user,
      });

      // Emit event for onUserCreate
      userEmitter.emit(events.onUserCreate, {
        company_id: result.company?.id,
        user: result.user,
        password,
      });

      return result.company;
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

      const company = await this.companyRepository.update({
        id,
        name,
        status,
        archived,
      });

      return company;
    } catch (err) {
      throw err;
    }
  };

  remove = async (args: IEntityRemove): Promise<Company> => {
    try {
      const id = args.id;

      const company = await this.companyRepository.remove({
        id,
      });

      return company;
    } catch (err) {
      throw err;
    }
  };
}
