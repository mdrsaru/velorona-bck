import { Field, InputType, ObjectType, Root } from 'type-graphql';

import Role from '../entities/role.entity';

@ObjectType()
export class LoginResponse {
  @Field()
  id: string;

  @Field()
  token: string;

  @Field((type) => [Role])
  roles: Role[];
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
  @Field({ nullable: true })
  token: string;

  @Field()
  password: string;
}
