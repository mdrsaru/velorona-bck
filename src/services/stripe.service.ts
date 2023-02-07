import Stripe from 'stripe';
import { Request } from 'express';
import isNil from 'lodash/isNil';
import isString from 'lodash/isString';
import { inject, injectable } from 'inversify';

import strings from '../config/strings';
import * as apiError from '../utils/api-error';
import constants, { stripeSetting, SubscriptionPaymentStatus } from '../config/constants';

import {
  IStripeCustomerCreateArgs,
  IStripeInvoiceArgs,
  IStripeSubscriptionCreateArgs,
  IStripeSubscriptionUpgradeArgs,
  IStripeUsageRecordCreateArgs,
  IStripeSubscriptionCancelArgs,
  IStripeSubscriptionRetrieveArgs,
  IStripeCustomerArgs,
} from '../interfaces/stripe.interface';
import { ISubscriptionPaymentRepository } from '../interfaces/subscription-payment.interface';
import { TYPES } from '../types';

@injectable()
export default class StripeService {
  private readonly stripe: Stripe;
  private subscriptionPaymentRepository: ISubscriptionPaymentRepository;

  constructor(
    @inject(TYPES.SubscriptionPaymentRepository) subscriptionPaymentRepository: ISubscriptionPaymentRepository
  ) {
    this.stripe = new Stripe(stripeSetting.secretKey, {
      apiVersion: '2020-08-27',
    });
    this.subscriptionPaymentRepository = subscriptionPaymentRepository;
  }

  constructEvent(args: { req: Request }) {
    try {
      const payload = JSON.stringify(args.req.body);
      const header = this.stripe.webhooks.generateTestHeaderString({
        payload,
        secret: stripeSetting.webhookSecret,
      });

      const event = this.stripe.webhooks.constructEvent(payload, header, stripeSetting.webhookSecret);

      return event;
    } catch (err) {
      throw err;
    }
  }

  createCustomer = async (args: IStripeCustomerCreateArgs) => {
    try {
      const email = args.email;
      const name: any = args.name;
      const city: any = args.city;
      const country: any = args.country;
      const streetAddress: any = args.streetAddress;
      const state: any = args.state;
      const metadata = args.metadata;

      let errors = [];

      if (isNil(email) || !isString(email)) {
        errors.push(strings.emailRequired);
      }

      if (errors.length) {
        throw new apiError.ValidationError({
          details: errors,
        });
      }

      const address: any = streetAddress + ',' + state;
      const customer = await this.stripe.customers.create({
        name,
        email,
        address: {
          line1: address,
          city: city,
          country: country,
        },
        metadata,
      });

      return customer;
    } catch (err) {
      throw err;
    }
  };

  retrieveCustomer = async (args: IStripeCustomerArgs) => {
    try {
      const customerId = args.customerId;
      let errors = [];

      if (isNil(customerId) || !isString(customerId)) {
        errors.push(strings.customerRequired);
      }

      if (errors.length) {
        throw new apiError.ValidationError({
          details: errors,
        });
      }

      const paymentMethods: any = await this.stripe.paymentMethods.list({
        customer: customerId,
        type: 'card',
      });

      return paymentMethods?.data;
    } catch (err) {
      throw err;
    }
  };

  createSubscription = async (args: IStripeSubscriptionCreateArgs) => {
    try {
      const customer = args.customer;
      const items = args.items;
      const payment_behavior = args.payment_behavior;
      const expand = args.expand;
      const payment_settings = args.payment_settings;
      const trial_end = args.trial_end;

      let errors = [];
      if (isNil(customer) || !isString(customer)) {
        errors.push(strings.customerRequired);
      }

      if (errors.length) {
        throw new apiError.ValidationError({
          details: errors,
        });
      }

      const subscriptionParams: Stripe.SubscriptionCreateParams = {
        customer,
        items,
      };

      if (payment_behavior) {
        subscriptionParams.payment_behavior = payment_behavior;
      }
      if (expand) {
        subscriptionParams.expand = expand;
      }
      if (payment_settings) {
        subscriptionParams.payment_settings = payment_settings;
      }
      if (trial_end) {
        subscriptionParams.trial_end = trial_end;
      }

      const subscription = await this.stripe.subscriptions.create(subscriptionParams);

      return subscription;
    } catch (err) {
      throw err;
    }
  };

  createUsageRecord = async (args: IStripeUsageRecordCreateArgs) => {
    try {
      const action = args.action;
      const quantity = args.quantity;
      const timestamp = args.timestamp;
      const subscriptionItemId = args.subscriptionItemId;

      const usageRecord = await this.stripe.subscriptionItems.createUsageRecord(subscriptionItemId, {
        quantity,
        action,
        timestamp,
      });

      return usageRecord;
    } catch (err) {
      throw err;
    }
  };

  upgradeSubscription = async (args: IStripeSubscriptionUpgradeArgs) => {
    try {
      const paymentId = args.paymentId;
      const subscriptionId = args.subscriptionId;
      const subscription = await this.stripe.subscriptions.retrieve(subscriptionId);

      await this.stripe.paymentMethods.attach(paymentId, { customer: subscription.customer as string });

      const result = await this.stripe.subscriptions.update(subscriptionId, {
        trial_end: 'now',
        cancel_at_period_end: false,
        default_payment_method: paymentId,
      });

      let paymentIntent = await this.stripe.paymentIntents.create({
        amount: constants.amount,
        currency: 'usd',
        customer: subscription.customer as string,
        payment_method: result.default_payment_method as string,
        payment_method_types: ['card'],
      });

      await this.stripe.paymentIntents.confirm(paymentIntent.id, { payment_method: 'pm_card_visa' });

      return {
        subscriptionId: result?.id,
      };
    } catch (err) {
      throw err;
    }
  };

  getInvoiceDetail = async (args: IStripeInvoiceArgs) => {
    try {
      const invoiceId = args.invoiceId;

      let invoice = await this.stripe.invoices.retrieve(invoiceId);
      return invoice;
    } catch (err) {
      throw err;
    }
  };

  cancelSubscription = async (args: IStripeSubscriptionCancelArgs) => {
    try {
      const subscription_id = args.subscription_id;
      const cancel_at_period_end = args.cancel_at_period_end;

      if (!subscription_id) {
        throw new apiError.ValidationError({
          details: ['Subscription is required'],
        });
      }

      const subscription = await this.stripe.subscriptions.update(subscription_id, {
        cancel_at_period_end,
      });

      return subscription;
    } catch (err) {
      throw err;
    }
  };

  retrieveSubscription = async (args: IStripeSubscriptionRetrieveArgs) => {
    try {
      const subscription_id = args.subscription_id;

      let errors = [];
      if (isNil(subscription_id) || !isString(subscription_id)) {
        errors.push(strings.subscriptionIdRequired);
      }

      if (errors.length) {
        throw new apiError.ValidationError({
          details: errors,
        });
      }

      const subscription = await this.stripe.subscriptions.retrieve(subscription_id);

      return subscription;
    } catch (err) {
      throw err;
    }
  };

  /**
   * Create setup intent
   * Docs: https://stripe.com/docs/api/setup_intents
   */
  createSetupIntent = async (args: Stripe.SetupIntentCreateParams) => {
    try {
      const { customer, ...rest } = args;

      let errors = [];
      if (isNil(customer) || !isString(customer)) {
        errors.push(strings.customerRequired);
      }

      if (errors.length) {
        throw new apiError.ValidationError({
          details: errors,
        });
      }

      const setupIntent = await this.stripe.setupIntents.create({
        customer,
        ...rest,
      });

      return setupIntent;
    } catch (err) {
      throw err;
    }
  };

  /**
   * Update subscription
   * @param {string} id - Subscription id
   * @param {Object} params - Subscription Update Params(Stripe.SubscriptionUpdateParams)
   */
  updateSubscription = async (id: string, params?: Stripe.SubscriptionUpdateParams) => {
    try {
      const subscription = await this.stripe.subscriptions.update(id, params);

      return subscription;
    } catch (err) {
      throw err;
    }
  };

  createToken = async (args: any) => {
    try {
      //     // const subscription = await this.stripe.subscriptions.update(id, params);
      //     var param:any = {};
      //     param.card ={
      //         number: '4242424242424242',
      //         exp_month: 2,
      //         exp_year:2024,
      //         cvc:'212'
      //     }

      //     const token = await this.stripe.tokens.create(param)

      // let res = await this.stripe.customers.createSource('cus_NCfvpL3pYvVzQz',{source: token?.id})

      //  const cardDetail:any = await this.stripe.customers.retrieve('cus_NCfvpL3pYvVzQz')
      return 'createToken';
    } catch (err) {
      throw err;
    }
  };

  createPaymentIntent = async (args: any) => {
    const paymentIntent = await this.stripe.paymentIntents.create({
      payment_method_types: ['card'],
      amount: 1000,
      currency: 'usd',
    });

    return {
      clientSecret: paymentIntent.client_secret,
    };
  };
  subscriptionPayment = async (args: any) => {
    const customerId = args.customerId;
    const cardId = args.cardId;
    const company_id = args.company_id;
    const subscriptionPaymentId = args.subscriptionPaymentId;

    const subscriptionPayment = await this.subscriptionPaymentRepository.getById({
      id: subscriptionPaymentId,
    });

    const paymentIntent = await this.stripe.paymentIntents.create({
      payment_method_types: ['card'],
      amount: subscriptionPayment?.amount ?? 1000,
      currency: 'usd',
      customer: customerId,
      payment_method: cardId,
    });
    const paymentIntents = await this.stripe.paymentIntents.confirm(paymentIntent?.id, { payment_method: cardId });
    //  const id = subscriptionPayment?.invoiceId as string;
    //   const paidInvoice = await this.stripe.invoices.pay(id);
    // };
  };
}
