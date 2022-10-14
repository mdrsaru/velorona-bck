import { inject, injectable } from 'inversify';
import { Request, Response, NextFunction } from 'express';

import { TYPES } from '../types';
import { plans, subscriptionStatus, SubscriptionPaymentStatus, stripeSetting } from '../config/constants';
import * as apiError from '../utils/api-error';
import StripeService from '../services/stripe.service';

import { ILogger } from '../interfaces/common.interface';
import { ICompanyRepository } from '../interfaces/company.interface';
import { ISubscriptionService } from '../interfaces/subscription.interface';
import { ISubscriptionPaymentRepository } from '../interfaces/subscription-payment.interface';

@injectable()
export default class WebhookService {
  private logger: ILogger;
  private stripeService: StripeService;
  private subscriptionService: ISubscriptionService;
  private subscriptionPaymentRepository: ISubscriptionPaymentRepository;
  private companyRepository: ICompanyRepository;

  constructor(
    @inject(TYPES.LoggerFactory) loggerFactory: (name: string) => ILogger,
    @inject(TYPES.StripeService) _stripeService: StripeService,
    @inject(TYPES.SubscriptionService) _subscriptionService: ISubscriptionService,
    @inject(TYPES.SubscriptionPaymentRepository) _subscriptionPaymentRepository: ISubscriptionPaymentRepository,
    @inject(TYPES.CompanyRepository) _companyRepository: ICompanyRepository
  ) {
    this.logger = loggerFactory('WebhookService');
    this.stripeService = _stripeService;
    this.subscriptionService = _subscriptionService;
    this.subscriptionPaymentRepository = _subscriptionPaymentRepository;
    this.companyRepository = _companyRepository;
  }

  /**
   * Handle event - invoice.paid
   * Create subscription payment and update the subscription for the company
   */
  handleInvoicePaid = async (eventObject: any) => {
    const operation = 'handleInvoicePaid';

    try {
      const subscription_id = eventObject.data.object?.subscription;

      if (subscription_id) {
        this.subscriptionPaymentRepository
          .create({
            amount: (eventObject?.data?.object?.total ?? 0) / 100,
            subscriptionId: subscription_id,
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
                event: eventObject,
              },
            });
          });

        let subscriptionPeriodEnd: Date | undefined;
        let trialEndDate: Date | undefined;

        const subscription = await this.stripeService.retrieveSubscription({
          subscription_id,
        });

        const status = subscription?.status ?? subscriptionStatus.active;
        if (subscription.current_period_end) {
          subscriptionPeriodEnd = new Date(subscription.current_period_end * 1000);
        }
        if (subscription.trial_end) {
          trialEndDate = new Date(subscription.trial_end * 1000);
        }

        this.subscriptionService
          .updateSubscription({
            subscription_id,
            plan: plans.Professional,
            eventObject: eventObject,
            subscriptionStatus: status,
            subscriptionPeriodEnd,
            trialEndDate,
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
                event: eventObject,
              },
            });
          });
      }
    } catch (err) {
      throw err;
    }
  };

  /**
   * Handle subscription canceled
   */
  handleSubscriptionDeleted = async (eventObject: any): Promise<void> => {
    const operation = 'handleSubscriptionDeleted';
    const subscription_id = eventObject?.data?.object?.id;
    const metadata = eventObject?.data?.object?.metadata;

    const company_id = metadata?.company_id;
    const downgrade = metadata?.downgrade;

    if (downgrade) {
      this.companyRepository
        .update({
          id: company_id,
          plan: 'Starter',
          subscriptionId: null,
          subscriptionItemId: null,
          subscriptionStatus: 'active',
          subscriptionPeriodEnd: null,
          trialEndDate: null,
          trialEnded: false,
        })
        .then((response) => {
          this.logger.info({
            operation,
            message: `Subscription downgraded for company - ${response.name}`,
            data: {
              company: response.id,
              companyCode: response.companyCode,
            },
          });
        })
        .catch((err) => {
          this.logger.error({
            operation,
            message: `Error downgrading the subscription for company.`,
            data: {
              err,
              company: company_id,
            },
          });
        });
    } else {
      this.subscriptionService
        .updateSubscription({
          subscription_id,
          eventObject,
          subscriptionStatus: eventObject?.data?.object?.status ?? subscriptionStatus.canceled,
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
              eventObject,
            },
          });
        });
    }
  };

  /**
   * Handle event - invoice.payment_failed
   * Update the subscription status for the company
   */
  handleInvoicePaymentFailed = async (eventObject: any) => {
    const operation = 'handleInvoicePaymentFailed';
    const subscription_id = eventObject.data.object?.subscription;

    if (subscription_id) {
      const subscription = await this.stripeService.retrieveSubscription({
        subscription_id,
      });

      this.subscriptionService
        .updateSubscription({
          subscription_id,
          eventObject,
          subscriptionStatus: subscription?.status ?? subscriptionStatus.inactive,
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
              eventObject,
            },
          });
        });
    }
  };

  /**
   * Handle the subscription updated only from the trailing status
   */
  handleCustomerSubscriptionUpdated = async (eventObject: any) => {
    const operation = 'handleCustomerSubscriptionUpdated';

    const previous_attributes = eventObject?.data?.previous_attributes;
    const subscription_id = eventObject?.data?.object?.id;

    if (previous_attributes?.status === subscriptionStatus.trialing) {
      const status = eventObject?.data?.object?.status ?? subscriptionStatus.inactive;

      this.subscriptionService
        .updateSubscription({
          subscription_id,
          eventObject,
          subscriptionStatus: status,
          trialEnded: true,
        })
        .then((company) => {
          this.logger.info({
            operation,
            message: 'Subscription updated with previous status trialing',
            data: {
              company: company.id,
              companyCode: company.companyCode,
              previous_status: previous_attributes?.status,
              currentStatus: status,
            },
          });
        })
        .catch((err) => {
          this.logger.error({
            operation,
            message: `Error updating the subscription.`,
            data: {
              err,
              eventObject,
            },
          });
        });
    }
  };

  /**
   * Update subscription with the payment method
   */
  handleSetupIntentCreate = async (eventObject: any): Promise<void> => {
    const operation = 'handleSetupIntentCreate';

    try {
      const obj = eventObject?.data?.object;
      const subscription_id = obj?.metadata?.subscription_id;
      const company_id = obj?.metadata?.company_id;
      const customer_id = obj?.metadata?.customer_id;
      const payment_method = obj?.payment_method;

      if (subscription_id && company_id) {
        const subscription = await this.stripeService.updateSubscription(subscription_id, {
          default_payment_method: payment_method,
        });

        this.logger.info({
          operation,
          message: `Payment details for ${company_id} has been updated.`,
          data: {
            subscription_id,
            customer_id,
            company_id,
          },
        });
      }
    } catch (err) {
      this.logger.error({
        operation,
        message: 'Error updating subscription with the payment method.',
        data: err,
      });
    }
  };
}
