import { ObjectType, Field, InputType } from 'type-graphql';

@ObjectType()
export class SubscriptionCreateResult {
  @Field()
  clientSecret: string;

  @Field()
  subscriptionId: string;
}

@InputType()
export class SubscriptionCreateInput {
  @Field()
  company_id: string;
}
