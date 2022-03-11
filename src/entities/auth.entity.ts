import { Field, InputType, ObjectType } from 'type-graphql';

@ObjectType()
export class LoginResponse {
  @Field()
  id: string;

  @Field()
  token?: string;
}

@InputType()
export class LoginInput {
  @Field()
  email: string;

  @Field()
  password: string;
}
