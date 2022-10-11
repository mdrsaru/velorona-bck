import { inject, injectable } from 'inversify';
import { Request, Response, NextFunction } from 'express';

import { TYPES } from '../types';
import { plans, subscriptionStatus, SubscriptionPaymentStatus, stripeSetting } from '../config/constants';
import * as apiError from '../utils/api-error';
import StripeService from '../services/stripe.service';

import { ILogger } from '../interfaces/common.interface';
import { ISubscriptionService } from '../interfaces/subscription.interface';
import { ISubscriptionPaymentRepository } from '../interfaces/subscription-payment.interface';

@injectable()
export default class WebhookController {
  private logger: ILogger;
  private stripeService: StripeService;
  private subscriptionService: ISubscriptionService;
  private subscriptionPaymentRepository: ISubscriptionPaymentRepository;

  constructor(
    @inject(TYPES.LoggerFactory) loggerFactory: (name: string) => ILogger,
    @inject(TYPES.StripeService) _stripeService: StripeService,
    @inject(TYPES.SubscriptionService) _subscriptionService: ISubscriptionService,
    @inject(TYPES.SubscriptionPaymentRepository) _subscriptionPaymentRepository: ISubscriptionPaymentRepository
  ) {
    this.logger = loggerFactory('WebhookController');
    this.stripeService = _stripeService;
    this.subscriptionService = _subscriptionService;
    this.subscriptionPaymentRepository = _subscriptionPaymentRepository;
  }

  stripe = async (req: Request, res: Response, next: NextFunction) => {
    const operation = 'stripe';

    try {
      const event = this.stripeService.constructEvent({
        req,
      });

      switch (event.type) {
        case 'invoice.paid':
          this.subscriptionPaymentRepository
            .create({
              amount: ((event?.data?.object as any)?.total ?? 0) / 100,
              subscriptionId: (event.data.object as any)?.subscription,
              paymentDate: new Date(),
              status: SubscriptionPaymentStatus.Paid,
            })
            .then((subscriptionPayment) => {
              this.logger.info({
                operation,
                message: `Payment invoice genereted for company ${subscriptionPayment.company_id}`,
                data: {
                  company: subscriptionPayment.company_id,
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

          const subscription_id = (event.data.object as any)?.subscription;
          let subscriptionPeriodEnd: Date | undefined;

          if (subscription_id) {
            const subscription = await this.stripeService.retrieveSubscription({
              subscription_id,
            });

            if (subscription.current_period_end) {
              subscriptionPeriodEnd = new Date(subscription.current_period_end * 1000);
            }
          }

          this.subscriptionService
            .updateSubscription({
              plan: plans.Professional,
              eventObject: event,
              subscriptionStatus: subscriptionStatus.active,
              subscriptionPeriodEnd,
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

        case 'customer.subscription.deleted':
          this.subscriptionService
            .updateSubscription({
              eventObject: event,
              subscriptionStatus: (event?.data?.object as any)?.status ?? subscriptionStatus.inactive,
            })
            .then((company) => {
              this.logger.info({
                operation,
                message: `Subscription deleted/canceled for. company ${company.id} - ${company.companyCode}`,
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

        // TODO: Notify customer and handle the payment
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

        case 'customer.subscription.updated':
          let eventObject = event as any;
          const invoice = await this.stripeService.getInvoiceDetail({
            invoiceId: eventObject?.data?.object?.latest_invoice,
          });
          if (invoice.status === 'draft') {
            this.subscriptionService
              .updateSubscription({
                eventObject: event,
                subscriptionStatus: subscriptionStatus.inactive,
                trialEnded: true,
              })
              .then((company) => {
                this.logger.info({
                  operation,
                  message: `Trial ended.`,
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
          }
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
