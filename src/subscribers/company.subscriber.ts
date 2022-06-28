import { companyEmitter } from './emitters';
import constants, { events } from '../config/constants';
import { TYPES } from '../types';
import container from '../inversify.config';
import Company from '../entities/company.entity';
import StripeService from '../services/stripe.service';

import { ILogger } from '../interfaces/common.interface';
import { ICompanyRepository } from '../interfaces/company.interface';
import { IUserRepository } from '../interfaces/user.interface';

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
    select: ['id', 'companyCode', 'subscriptionItemId', 'subscriptionId'],
  });

  if (company && company.subscriptionId && company.subscriptionItemId) {
    const userCount = await userRepository.countEntities({
      query: {
        company_id,
        archived: false,
      },
    });

    stripeService
      .createUsageRecord({
        quantity: userCount - 1, // ignoring main company admin
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

export default companyEmitter;