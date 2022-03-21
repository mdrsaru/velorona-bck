import { Field, InputType, ObjectType, Root } from 'type-graphql';

import Role from '../entities/role.entity';
import UserToken from './user-token.entity';
import Client from '../entities/client.entity';

@ObjectType()
export class LoginResponse {
  @Field()
  id: string;

  @Field()
  token: string;

  @Field()
  refreshToken: string;

  @Field((type) => [Role])
  roles: Role[];

  @Field((type) => Client, { nullable: true })
  client: Client;
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

  @Field({ nullable: true })
  clientCode: string;
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
