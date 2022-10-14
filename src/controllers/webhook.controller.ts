import { inject, injectable } from 'inversify';
import { Request, Response, NextFunction } from 'express';

import { TYPES } from '../types';
import * as apiError from '../utils/api-error';
import StripeService from '../services/stripe.service';
import WebhookService from '../services/webhook.service';

@injectable()
export default class WebhookController {
  private stripeService: StripeService;
  private webhookService: WebhookService;

  constructor(
    @inject(TYPES.StripeService) _stripeService: StripeService,
    @inject(TYPES.WebhookService) _webhookService: WebhookService
  ) {
    this.stripeService = _stripeService;
    this.webhookService = _webhookService;
  }

  stripe = async (req: Request, res: Response, next: NextFunction) => {
    const operation = 'stripe';

    try {
      const event = this.stripeService.constructEvent({
        req,
      });

      switch (event.type) {
        case 'invoice.paid':
          this.webhookService.handleInvoicePaid(event);
          break;

        case 'customer.subscription.deleted':
          this.webhookService.handleSubscriptionDeleted(event);
          break;

        case 'setup_intent.succeeded':
          this.webhookService.handleSetupIntentCreate(event);
          break;

        case 'invoice.payment_failed':
          this.webhookService.handleInvoicePaymentFailed(event);
          break;

        case 'customer.subscription.updated':
          this.webhookService.handleCustomerSubscriptionUpdated(event);
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
