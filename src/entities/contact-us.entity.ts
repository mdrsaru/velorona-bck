import { InputType, Field } from 'type-graphql';

@InputType()
export class ContactUsInput {
  @Field()
  userName: string;

  @Field()
  email: string;

  @Field()
  contact: string;

  @Field()
  message: string;
}
