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
export class SubscriptionCancelInput {
  @Field()
  company_id: string;
}
