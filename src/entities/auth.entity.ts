import { Field, InputType, ObjectType, Root } from 'type-graphql';

import Role from '../entities/role.entity';
import UserToken from './user-token.entity';
import Client from '../entities/client.entity';
import { AddressCreateInput } from '../entities/address.entity';
import { UserRecordCreateInput } from '../entities/user-record.entity';

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

@InputType()
export class InvitationRegisterInput {
  @Field()
  token: string;

  @Field()
  password: string;

  @Field()
  firstName: string;

  @Field()
  lastName: string;

  @Field({ nullable: true })
  middleName: string;

  @Field()
  phone: string;

  @Field((type) => AddressCreateInput)
  address: AddressCreateInput;

  @Field((type) => UserRecordCreateInput)
  record: UserRecordCreateInput;
}

@ObjectType()
export class InvitationRegisterResponse {
  @Field()
  id: string;
}
