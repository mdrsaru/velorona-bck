import Stripe from 'stripe';
import find from 'lodash/find';
import isNil from 'lodash/isNil';
import { inject, injectable } from 'inversify';

import { TYPES } from '../types';
import strings from '../config/strings';
import * as apiError from '../utils/api-error';
import { stripeSetting, stripePrices, plans } from '../config/constants';
import Company from '../entities/company.entity';
import StripeService from '../services/stripe.service';

import {
  ISubscriptionCreateInput,
  ISubscriptionCreateResult,
  ISubscriptionUpdateInput,
  ISubscriptionService,
} from '../interfaces/subscription.interface';
import { ICompanyRepository } from '../interfaces/company.interface';

@injectable()
export default class SubscriptionService implements ISubscriptionService {
  private name = 'MediaService';
  private readonly stripe: Stripe;
  private companyRepository: ICompanyRepository;
  private stripeService: StripeService;

  constructor(
    @inject(TYPES.CompanyRepository) _companyRepository: ICompanyRepository,
    @inject(TYPES.StripeService) _stripeService: StripeService
  ) {
    this.companyRepository = _companyRepository;
    this.stripeService = _stripeService;

    this.stripe = new Stripe(stripeSetting.secretKey, {
      apiVersion: '2020-08-27',
    });
  }

  createSubscription = async (args: ISubscriptionCreateInput): Promise<any> => {
    try {
      const company_id = args.company_id;
      const prices = args.prices;

      const company = await this.companyRepository.getById({
        id: company_id,
        select: ['id', 'adminEmail', 'plan', 'subscriptionStatus'],
      });

      if (!company) {
        throw new apiError.NotFoundError({
          details: [strings.companyNotFound],
        });
      }

      if (company.plan === plans.Professional || company.subscriptionStatus === 'active') {
        throw new apiError.ConflictError({
          details: [strings.companyAlreadySubscribed],
        });
      }

      const customer = await this.stripeService.createCustomer({
        email: company.adminEmail,
      });

      const subscription = (await this.stripeService.createSubscription({
        customer: customer.id,
        items: prices.map((price) => ({ price })),
        payment_behavior: 'default_incomplete',
        expand: ['latest_invoice.payment_intent'],
        payment_settings: { save_default_payment_method: 'on_subscription' },
      })) as any;

      const items = subscription?.items?.data ?? [];
      const subscriptionId = subscription.id;
      let subscriptionItemId: string | undefined = undefined;

      const meteredItem = find(items, { price: { id: stripePrices.perUser } });
      if (meteredItem) {
        subscriptionItemId = meteredItem?.id;
      }

      //Update the company with the subscription id for provisioning the service.
      await this.companyRepository.update({
        id: company.id,
        subscriptionId,
        subscriptionItemId,
        stripeCustomerId: customer.id,
      });

      return {
        subscriptionId,
        clientSecret: subscription.latest_invoice.payment_intent.client_secret ?? '',
      };
    } catch (err) {
      throw err;
    }
  };

  updateSubscription = async (args: ISubscriptionUpdateInput): Promise<Company> => {
    try {
      const plan = args.plan;
      const eventObject = args.eventObject;
      const subscriptionId = eventObject?.data?.object?.subscription;
      const subscriptionStatus = args.subscriptionStatus;

      const company = await this.companyRepository.getSingleEntity({
        query: {
          subscriptionId,
        },
        select: ['id', 'companyCode'],
      });

      if (!company) {
        throw new apiError.NotFoundError({
          details: [strings.companyNotFound],
        });
      }

      //Update the company with the required plan for provisioning the service.
      await this.companyRepository.update({
        id: company.id,
        plan,
        subscriptionStatus,
      });

      return company;
    } catch (err) {
      throw err;
    }
  };
}
