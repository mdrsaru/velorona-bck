import { plans } from '../config/constants';
import Company from '../entities/company.entity';

export interface ISubscriptionCreateInput {
  prices: string[];
  company_id: string;
  trial?: boolean;
}

export interface ISubscriptionUpgradeInput {
  company_id: string;
  userId: string;
  paymentId: string;
}
export interface ISubscriptionCreateResult {
  /**
   * Stripe client secret for payment
   */
  clientSecret: string;
  /**
   * Stripe subscription id
   */
  subscriptionId: string;
}

export interface ISubscriptionUpdateInput {
  /**
   * Stripe event object
   */
  subscription_id: string;
  eventObject: any;
  plan?: string;
  subscriptionStatus?: string;
  trialEnded?: boolean;
  subscriptionPeriodEnd?: Date;
  trialEndDate?: Date;
}

export interface ISubscriptionCancelInput {
  company_id: string;
}

export interface ISetupIntentInput {
  company_id: string;
}

export interface ISubscriptionDowngradeInput {
  company_id: string;
  plan: 'Starter';
}

export interface ISubscriptionService {
  /**
   * Create a subscription for company with the incomplete payment(which will be updated after the payment is received)
   */
  createSubscription(args: ISubscriptionCreateInput): Promise<ISubscriptionCreateResult>;
  /**
   * Update subscription for a company
   */
  updateSubscription(args: ISubscriptionUpdateInput): Promise<Company>;

  upgradeSubscription(args: ISubscriptionUpgradeInput): Promise<ISubscriptionCreateResult>;
  /**
   * Cancel subscription
   */
  cancelSubscription(args: ISubscriptionCancelInput): Promise<Company>;
  /**
   * Create setup intent for updating the payment details
   * Docs: https://stripe.com/docs/payments/save-and-reuse?platform=web&html-or-react=react
   */
  createSetupIntent(args: ISetupIntentInput): Promise<any>;
  /**
   * Downgrade subscription
   * Cancels the subscription at the period end and downgrades to Free Plan
   */
  downgradeSubscription(args: ISubscriptionDowngradeInput): Promise<void>;

  subscriptionPaymentReminder(args: any): Promise<void>;
}
