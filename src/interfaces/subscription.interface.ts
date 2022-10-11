import Company from '../entities/company.entity';

export interface ISubscriptionCreateInput {
  prices: string[];
  company_id: string;
  trial?: boolean;
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
  eventObject: any;
  plan?: string;
  subscriptionStatus?: string;
  trialEnded?: boolean;
  subscriptionPeriodEnd?: Date;
}

export interface ISubscriptionCancelInput {
  company_id: string;
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
  /**
   * Cancel subscription
   */
  cancelSubscription(args: ISubscriptionCancelInput): Promise<Company>;
}
