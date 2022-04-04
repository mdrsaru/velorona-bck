import { injectable, inject } from 'inversify';

import { ICompanyCreate, ICompanyUpdate, ICompanyRepository, ICompanyService } from '../interfaces/company.interface';
import Company from '../entities/company.entity';
import Paging from '../utils/paging';
import { TYPES } from '../types';
import { IPagingArgs, IPaginationData } from '../interfaces/paging.interface';
import { IEntityRemove, IEntityID } from '../interfaces/common.interface';
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

      const company = await this.companyRepository.create({
        name,
        status,
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
