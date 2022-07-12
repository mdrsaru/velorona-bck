import { inject, injectable } from 'inversify';
import { Request, Response, NextFunction } from 'express';

import { TYPES } from '../types';
import { plans, subscriptionStatus } from '../config/constants';
import * as apiError from '../utils/api-error';
import StripeService from '../services/stripe.service';

import { ILogger } from '../interfaces/common.interface';
import { ISubscriptionService } from '../interfaces/subscription.interface';

@injectable()
export default class WebhookController {
  private logger: ILogger;
  private stripeService: StripeService;
  private subscriptionService: ISubscriptionService;

  constructor(
    @inject(TYPES.LoggerFactory) loggerFactory: (name: string) => ILogger,
    @inject(TYPES.StripeService) _stripeService: StripeService,
    @inject(TYPES.SubscriptionService) _subscriptionService: ISubscriptionService
  ) {
    this.logger = loggerFactory('WebhookController');
    this.stripeService = _stripeService;
    this.subscriptionService = _subscriptionService;
  }

  stripe = async (req: Request, res: Response, next: NextFunction) => {
    const operation = 'stripe';

    try {
      const event = this.stripeService.constructEvent({
        req,
      });

      switch (event.type) {
        case 'invoice.paid':
          this.subscriptionService
            .updateSubscription({
              plan: plans.Professional,
              eventObject: event,
              subscriptionStatus: subscriptionStatus.active,
            })
            .then((company) => {
              this.logger.info({
                operation,
                message: `Company ${company.id} - ${company.companyCode} subscription updated with Professional plan`,
                data: {
                  company: company.id,
                },
              });
            })
            .catch((err) => {
              this.logger.error({
                operation,
                message: `Error updating the subscription.`,
                data: {
                  err,
                  event,
                },
              });
            });

          break;

        case 'invoice.payment_failed':
          this.subscriptionService
            .updateSubscription({
              eventObject: event,
              subscriptionStatus: subscriptionStatus.inactive,
            })
            .then((company) => {
              this.logger.info({
                operation,
                message: `Payment failed. Company ${company.id} - ${company.companyCode} subscription updated with Starter plan`,
                data: {
                  company: company.id,
                  companyCode: company.companyCode,
                },
              });
            })
            .catch((err) => {
              this.logger.error({
                operation,
                message: `Error updating the subscription.`,
                data: {
                  err,
                  event,
                },
              });
            });

          break;

        default:
          throw new apiError.NotImplementedError({
            details: [`Unexpected event type: ${event.type}`],
          });
      }

      return res.status(200).send();
    } catch (err) {
      next(err);
    }
  };
}
