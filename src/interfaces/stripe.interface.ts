export interface IStripeCustomerCreateArgs {
  email: string;
  name?: string;
  metadata?: any;
}

export interface IStripeCustomerArgs {
  customerId: string;
}

export interface IStripeSubscriptionItem {
  price: string;
}

export interface IStripeSubscriptionCreateArgs {
  /**
   * Stripe Customer Id
   */
  customer: string;
  /**
   * Stripe price Id
   */
  items?: IStripeSubscriptionItem[];
  payment_behavior?: any;
  payment_settings?: any;
  expand?: string[];
  trial_end?: number;
  cancel_at_period_end?: boolean;
}

export interface IStripeUsageRecordCreateArgs {
  subscriptionItemId: string;
  quantity: number;
  action: 'set' | 'increment';
  timestamp: number;
}

export interface IStripeSubscriptionUpgradeArgs {
  subscriptionId: string;
  paymentId: string;
}

export interface IStripeInvoiceArgs {
  invoiceId: string;
}

export interface IStripeSubscriptionCancelArgs {
  subscription_id: string;
  cancel_at_period_end: boolean;
}

export interface IStripeSubscriptionRetrieveArgs {
  subscription_id: string;
}
