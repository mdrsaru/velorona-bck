export interface IStripeCustomerCreateArgs {
  email: string;
  name?: string;
  metadata?: any;
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
  items: IStripeSubscriptionItem[];
  payment_behavior?: any;
  payment_settings?: any;
  expand?: string[];
  trial_end?: number;
}

export interface IStripeUsageRecordCreateArgs {
  subscriptionItemId: string;
  quantity: number;
  action: 'set' | 'increment';
  timestamp: number;
}

export interface IStripeInvoiceArgs {
  invoiceId: string;
}
