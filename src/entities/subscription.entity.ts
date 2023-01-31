import { ObjectType, Field, InputType } from 'type-graphql';

@ObjectType()
export class SubscriptionCreateResult {
  @Field()
  clientSecret: string;

  @Field()
  subscriptionId: string;
}

@ObjectType()
export class SubscriptionUpgradeResult {
  @Field({ nullable: true })
  subscriptionId: string;
}
@InputType()
export class SubscriptionCreateInput {
  @Field()
  company_id: string;
}

@InputType()
export class SubscriptionUpgradeInput {
  @Field()
  company_id: string;

  @Field()
  paymentId: string;
}

@InputType()
export class SubscriptionPaymentInput {
  @Field()
  cardId: string;

  @Field()
  customerId: string;
}

@InputType()
export class CreatePaymentIntentInput {
  @Field({ nullable: true })
  customerId: string;
}

@ObjectType()
export class PaymentIntentResponse {
  @Field({ nullable: true })
  clientSecret: string;
}

@InputType()
export class SubscriptionCancelInput {
  @Field()
  company_id: string;
}

@InputType()
export class SetupIntentSecretInput {
  @Field()
  company_id: string;
}

@ObjectType()
export class SetupIntentResult {
  @Field()
  clientSecret: string;
}

@InputType()
export class SubscriptionDowngradeInput {
  @Field()
  company_id: string;
}
