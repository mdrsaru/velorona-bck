import moment from 'moment';
import Stripe from 'stripe';
import find from 'lodash/find';
import isNil from 'lodash/isNil';
import { inject, injectable } from 'inversify';

import { TYPES } from '../types';
import strings from '../config/strings';
import * as apiError from '../utils/api-error';
import {
  stripeSetting,
  stripePrices,
  plans,
  Role as RoleEnum,
  subscriptionStatus as subscriptionStatusConfig,
} from '../config/constants';
import Company from '../entities/company.entity';
import StripeService from '../services/stripe.service';

import {
  ISubscriptionCreateInput,
  ISubscriptionCreateResult,
  ISubscriptionUpdateInput,
  ISubscriptionService,
  ISubscriptionUpgradeInput,
  ISubscriptionCancelInput,
} from '../interfaces/subscription.interface';
import { IStripeSubscriptionCreateArgs } from '../interfaces/stripe.interface';
import { ICompanyRepository } from '../interfaces/company.interface';
import { IUserRepository } from '../interfaces/user.interface';

@injectable()
export default class SubscriptionService implements ISubscriptionService {
  private name = 'SubscriptionService';
  private readonly stripe: Stripe;
  private companyRepository: ICompanyRepository;
  private stripeService: StripeService;
  private userRepository: IUserRepository;

  constructor(
    @inject(TYPES.CompanyRepository) _companyRepository: ICompanyRepository,
    @inject(TYPES.StripeService) _stripeService: StripeService,
    @inject(TYPES.UserRepository) _userRepository: IUserRepository
  ) {
    this.companyRepository = _companyRepository;
    this.stripeService = _stripeService;
    this.userRepository = _userRepository;

    this.stripe = new Stripe(stripeSetting.secretKey, {
      apiVersion: '2020-08-27',
    });
  }

  createSubscription = async (args: ISubscriptionCreateInput): Promise<any> => {
    try {
      const company_id = args.company_id;
      const trial = args?.trial;
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

      if (company.subscriptionStatus === 'active') {
        throw new apiError.ConflictError({
          details: [strings.companyAlreadySubscribed],
        });
      }

      const customer = await this.stripeService.createCustomer({
        email: company.adminEmail,
      });

      const subscriptionPayload: IStripeSubscriptionCreateArgs = {
        customer: customer.id,
        items: prices.map((price) => ({ price })),
        cancel_at_period_end: false,
      };

      if (trial) {
        const threeMonths = moment().add(3, 'months').unix();
        subscriptionPayload.trial_end = threeMonths;
      } else {
        subscriptionPayload.payment_behavior = 'default_incomplete';
        subscriptionPayload.expand = ['latest_invoice.payment_intent'];
        subscriptionPayload.payment_settings = { save_default_payment_method: 'on_subscription' };
      }

      const subscription = (await this.stripeService.createSubscription({
        ...subscriptionPayload,
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

      if (subscriptionItemId) {
        const userCount = await this.userRepository.countEntities({
          query: {
            company_id,
            archived: false,
            role: RoleEnum.Employee,
          },
        });

        await this.stripeService.createUsageRecord({
          quantity: userCount,
          action: 'set',
          subscriptionItemId: subscriptionItemId,
          timestamp: Math.floor(Date.now() / 1000),
        });
      }

      //Update the company with the subscription id for provisioning the service.
      await this.companyRepository.update({
        id: company.id,
        subscriptionId,
        subscriptionItemId,
        stripeCustomerId: customer.id,
        subscriptionPeriodEnd: subscription.current_period_end
          ? new Date(subscription.current_period_end * 1000)
          : undefined,
      });

      return {
        subscriptionId,
        clientSecret: subscription?.latest_invoice?.payment_intent?.client_secret ?? '',
      };
    } catch (err) {
      throw err;
    }
  };

  updateSubscription = async (args: ISubscriptionUpdateInput): Promise<Company> => {
    try {
      const plan = args.plan;
      const eventObject = args.eventObject;
      const subscriptionId = eventObject?.data?.object?.subscription ?? eventObject?.data?.object?.id;
      const subscriptionStatus = args.subscriptionStatus;
      const trialEnded = args?.trialEnded;
      const subscriptionPeriodEnd = args?.subscriptionPeriodEnd;

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
        trialEnded,
        subscriptionPeriodEnd,
      });

      return company;
    } catch (err) {
      throw err;
    }
  };

  cancelSubscription = async (args: ISubscriptionCancelInput): Promise<Company> => {
    try {
      const company_id = args.company_id;

      const company = await this.companyRepository.getSingleEntity({
        query: {
          id: company_id,
        },
        select: ['id', 'companyCode', 'subscriptionId'],
      });

      if (!company) {
        throw new apiError.NotFoundError({
          details: [strings.companyNotFound],
        });
      }

      if (!company.subscriptionId) {
        throw new apiError.NotFoundError({
          details: [strings.companySubscriptionNotFound],
        });
      }

      //Update the company with the required plan for provisioning the service.
      await this.stripeService.cancelSubscription({
        subscription_id: company.subscriptionId,
        cancel_at_period_end: true,
      });

      return company;
    } catch (err) {
      throw err;
    }
  };

  upgradeSubscription = async (args: ISubscriptionUpgradeInput): Promise<any> => {
    try {
      const company_id = args.company_id;
      const userId = args.userId;
      const paymentId = args.paymentId;

      const company = await this.companyRepository.getSingleEntity({
        query: {
          id: company_id,
          adminEmail: userId,
        },
        select: ['id', 'subscriptionId'],
      });

      if (!company) {
        throw new apiError.NotFoundError({
          details: [strings.companyNotFound],
        });
      }

      const subscription = await this.stripeService.upgradeSubscription({
        subscriptionId: company?.subscriptionId as string,
        paymentId,
      });

      await this.companyRepository.update({
        id: company_id,
        subscriptionStatus: subscriptionStatusConfig.active,
        trialEnded: false,
      });
      return subscription;
    } catch (err) {
      throw err;
    }
  };
}
