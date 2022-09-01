import Stripe from 'stripe';
import { Request } from 'express';
import isNil from 'lodash/isNil';
import isString from 'lodash/isString';
import { inject, injectable } from 'inversify';

import strings from '../config/strings';
import * as apiError from '../utils/api-error';
import { stripeSetting } from '../config/constants';

import {
  IStripeCustomerCreateArgs,
  IStripeSubscriptionCreateArgs,
  IStripeUsageRecordCreateArgs,
} from '../interfaces/stripe.interface';

@injectable()
export default class StripeService {
  private readonly stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(stripeSetting.secretKey, {
      apiVersion: '2020-08-27',
    });
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
      const name = args.name;
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

      const customer = await this.stripe.customers.create({
        name,
        email,
        metadata,
      });

      return customer;
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
}
