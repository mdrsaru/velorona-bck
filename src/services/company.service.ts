import { injectable, inject } from 'inversify';

import { TYPES } from '../types';
import strings from '../config/strings';
import { CompanyStatus, events, plans, stripePrices } from '../config/constants';
import Company from '../entities/company.entity';
import Paging from '../utils/paging';
import userEmitter from '../subscribers/user.subscriber';
import { generateRandomStrings } from '../utils/strings';
import * as apiError from '../utils/api-error';

import { IPagingArgs, IPaginationData } from '../interfaces/paging.interface';
import { IEntityRemove, IReminderInput } from '../interfaces/common.interface';
import { ICompanyCreate, ICompanyUpdate, ICompanyRepository, ICompanyService } from '../interfaces/company.interface';
import { IUserRepository } from '../interfaces/user.interface';
import companyEmitter from '../subscribers/company.subscriber';
import moment from 'moment';

@injectable()
export default class CompanyService implements ICompanyService {
  private companyRepository: ICompanyRepository;
  private userRepository: IUserRepository;

  constructor(
    @inject(TYPES.CompanyRepository) companyRepository: ICompanyRepository,
    @inject(TYPES.UserRepository) userRepository: IUserRepository
  ) {
    this.companyRepository = companyRepository;
    this.userRepository = userRepository;
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
      const logo_id = args?.logo_id;
      const plan = args?.plan;
      let unapprovedNotification = false;
      if (status === CompanyStatus.Unapproved) {
        unapprovedNotification = true;
      }

      let password = user.password;

      if (!user.password) {
        password = generateRandomStrings({ length: 8 });
        user.password = password;
      }

      const result = await this.companyRepository.create({
        name,
        status,
        archived,
        user,
        logo_id,
        plan,
        unapprovedNotification,
      });

      if (result?.company?.status === CompanyStatus.Unapproved) {
        // Emit event for onCompanyRegistered
        companyEmitter.emit(events.onCompanyRegistered, {
          name: result?.company?.name,
          email: result?.company?.adminEmail,
        });
      }

      // Emit event for onUserCreate
      userEmitter.emit(events.onUserCreate, {
        company_id: result.company?.id,
        user: result.user,
        password,
      });

      if (plan === plans.Professional) {
        companyEmitter.emit(events.onSubscriptionCreate, {
          company_id: result.company?.id,
          prices: [stripePrices.flatPrice, stripePrices.perUser],
        });
      }
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
      const logo_id = args?.logo_id;
      const user = args?.user;

      let data: ICompanyUpdate = {
        id,
        name,
        status,
        archived,
        logo_id,
        user,
      };

      if (status !== CompanyStatus.Unapproved) {
        data.unapprovedNotification = false;
      } else if (status === CompanyStatus.Unapproved) {
        data.unapprovedNotification = true;
      }

      const company = await this.companyRepository.update(data);

      return company;
    } catch (err) {
      throw err;
    }
  };

  subscriptionReminder = async (args: IReminderInput): Promise<Company[]> => {
    try {
      const date = args.date;

      const companies = await this.companyRepository.getAll({ relations: ['logo'] });
      companies.map((company) => {
        if (company.subscriptionPeriodEnd) {
          let threeDayPriorDate = moment(company.subscriptionPeriodEnd).subtract(3, 'days').utc().format('YYYY-MM-DD');
          if (date === threeDayPriorDate) {
            // Emit sendSubscriptionEndReminderEmail event
            companyEmitter.emit(events.onSubscriptionEndReminder, {
              company,
              date: company.subscriptionPeriodEnd,
            });
          }
        }
      });
      return companies;
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
