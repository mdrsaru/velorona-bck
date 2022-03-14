import { Field, InputType, ObjectType } from 'type-graphql';

@ObjectType()
export class LoginResponse {
  @Field()
  id: string;

  @Field()
  token?: string;
}

@ObjectType()
export class ForgotPasswordResponse {
  @Field()
  token: string;
}

@ObjectType()
export class ResetPasswordResponse {
  @Field()
  message: string;
}
@InputType()
export class LoginInput {
  @Field()
  email: string;

  @Field()
  password: string;
}

@InputType()
export class ForgotPasswordInput {
  @Field()
  email: string;
}

@InputType()
export class ResetPasswordInput {
  @Field()
  token: string;

  @Field()
  password: string;
}
