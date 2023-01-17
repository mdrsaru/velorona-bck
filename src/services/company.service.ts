import { injectable, inject } from 'inversify';

import { TYPES } from '../types';
import strings from '../config/strings';
import { CollectionMethod, CompanyStatus, events, plans, stripePrices } from '../config/constants';
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
import StripeService from './stripe.service';

@injectable()
export default class CompanyService implements ICompanyService {
  private companyRepository: ICompanyRepository;
  private userRepository: IUserRepository;
  private stripeService: StripeService;

  constructor(
    @inject(TYPES.CompanyRepository) companyRepository: ICompanyRepository,
    @inject(TYPES.UserRepository) userRepository: IUserRepository,
    @inject(TYPES.StripeService) _stripeService: StripeService
  ) {
    this.companyRepository = companyRepository;
    this.userRepository = userRepository;
    this.stripeService = _stripeService;
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

      let collectionMethod;
      if (plan === plans.Professional) {
        collectionMethod = CollectionMethod.ChargeAutomaticatically;
      }
      const result = await this.companyRepository.create({
        name,
        status,
        archived,
        user,
        logo_id,
        plan,
        unapprovedNotification,
        collectionMethod,
      });

      if (result?.company?.status === CompanyStatus.Unapproved) {
        // Emit event for onCompanyRegistered
        companyEmitter.emit(events.onCompanyRegistered, {
          name: result?.company?.name,
          email: result?.company?.adminEmail,
          company: result?.company,
          user: result?.user,
        });
      }

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
      const logo_id = args?.logo_id;
      const user = args?.user;
      const collectionMethod = args?.collectionMethod;

      const foundCompany = await this.companyRepository.getById({ id });

      if (collectionMethod) {
        let input: any = {
          collection_method: collectionMethod,
        };
        if (collectionMethod === CollectionMethod.SendInvoice) {
          input.days_until_due = 3;
        }
        this.stripeService.updateSubscription(foundCompany?.subscriptionId as string, input);
      }
      let data: ICompanyUpdate = {
        id,
        name,
        status,
        archived,
        logo_id,
        user,
        collectionMethod,
      };

      if (status !== CompanyStatus.Unapproved) {
        data.unapprovedNotification = false;
      } else if (status === CompanyStatus.Unapproved) {
        data.unapprovedNotification = true;
      }

      const company = await this.companyRepository.update(data);

      if (company.plan === plans.Professional) {
        if (status === CompanyStatus.Active && foundCompany?.status === CompanyStatus.Unapproved) {
          companyEmitter.emit(events.onSubscriptionCreate, {
            company_id: company?.id,
            prices: [stripePrices.flatPrice, stripePrices.perUser],
            company,
          });
        }
      }
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
