import { companyEmitter } from './emitters';
import constants, { events, Role as RoleEnum } from '../config/constants';
import { TYPES } from '../types';
import container from '../inversify.config';
import Company from '../entities/company.entity';
import StripeService from '../services/stripe.service';

import { ILogger } from '../interfaces/common.interface';
import { ICompanyRepository } from '../interfaces/company.interface';
import { IUserRepository } from '../interfaces/user.interface';
import { ISubscriptionService } from '../interfaces/subscription.interface';

type UpdateCompanySubscriptionUsage = {
  company_id: string;
};

/*
 * On user create
 * Send email
 */
companyEmitter.on(events.updateCompanySubscriptionUsage, async (args: UpdateCompanySubscriptionUsage) => {
  const operation = events.updateCompanySubscriptionUsage;

  const logger = container.get<ILogger>(TYPES.Logger);
  logger.init('company.subscriber');

  const companyRepository: ICompanyRepository = container.get<ICompanyRepository>(TYPES.CompanyRepository);
  const userRepository: IUserRepository = container.get<IUserRepository>(TYPES.UserRepository);
  const stripeService: StripeService = container.get<StripeService>(TYPES.StripeService);

  const company_id = args.company_id;

  const company = await companyRepository.getById({
    id: company_id,
    select: ['id', 'companyCode', 'subscriptionItemId', 'subscriptionId', 'plan'],
  });

  if (company && company.plan === 'Professional' && company.subscriptionId && company.subscriptionItemId) {
    const userCount = await userRepository.countEntities({
      query: {
        company_id,
        archived: false,
        role: RoleEnum.Employee,
      },
    });

    stripeService
      .createUsageRecord({
        quantity: userCount,
        action: 'set',
        subscriptionItemId: company.subscriptionItemId,
        timestamp: Math.floor(Date.now() / 1000),
      })
      .then((response) => {
        logger.info({
          operation,
          message: `Subscription usage updated for the company ${company.id} - ${company.companyCode}`,
          data: {
            id: company.id,
            companyCode: company.companyCode,
            newQuantity: response.quantity,
            subscriptionItem: response.subscription_item,
          },
        });
      })
      .catch((err) => {
        logger.error({
          operation,
          message: `Error updating subscription usage for the company ${company.id} - ${company.companyCode}`,
          data: {
            id: company.id,
            companyCode: company.companyCode,
          },
        });
      });
  }
});

type CreateCompanySubscription = {
  company_id: string;
  prices: string[];
};

companyEmitter.on(events.onSubscriptionCreate, async (args: CreateCompanySubscription) => {
  const operation = events.updateCompanySubscriptionUsage;

  const logger = container.get<ILogger>(TYPES.Logger);
  logger.init('company.subscriber');

  const subscriptionService: ISubscriptionService = container.get<ISubscriptionService>(TYPES.SubscriptionService);
  const userRepository: IUserRepository = container.get<IUserRepository>(TYPES.UserRepository);
  const stripeService: StripeService = container.get<StripeService>(TYPES.StripeService);

  const company_id = args.company_id;
  const prices = args.prices;

  await subscriptionService
    .createSubscription({
      company_id,
      prices,
      trial: true,
    })
    .then((response) => {
      logger.info({
        operation,
        message: `Subscription created for the company ${company_id}`,
        data: {
          id: company_id,
        },
      });
    })
    .catch((err) => {
      logger.error({
        operation,
        message: `Error updating subscription usage for the company ${company_id}`,
        data: {
          id: company_id,
        },
      });
    });
});

export default companyEmitter;
