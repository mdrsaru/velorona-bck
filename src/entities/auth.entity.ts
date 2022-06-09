import { Field, InputType, ObjectType, Root, registerEnumType } from 'type-graphql';

import Role from '../entities/role.entity';
import UserToken from './user-token.entity';
import Company from '../entities/company.entity';
import { ForgotPasswordUserType } from '../config/constants';
import { AddressCreateInput } from '../entities/address.entity';
import Media from './media.entity';

registerEnumType(ForgotPasswordUserType, {
  name: 'ForgotPasswordUserType',
});

@ObjectType()
export class LoginResponse {
  @Field()
  id: string;

  @Field()
  token: string;

  @Field({ nullable: true })
  fullName: string;

  @Field({ nullable: true })
  avatar: Media;

  @Field()
  refreshToken: string;

  @Field((type) => [Role])
  roles: Role[];

  @Field((type) => Company, { nullable: true })
  company: Company;
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
  companyCode: string;
}

@InputType()
export class ForgotPasswordInput {
  @Field()
  email: string;

  @Field((type) => ForgotPasswordUserType)
  userType: ForgotPasswordUserType;

  @Field({ nullable: true })
  companyCode: string;
}

@InputType()
export class ResetPasswordInput {
  @Field()
  token: string;

  @Field()
  password: string;
}

@InputType()
export class ChangePasswordInput {
  @Field()
  user_id: string;

  @Field()
  oldPassword: string;

  @Field()
  newPassword: string;
}

@ObjectType()
export class ChangePasswordResponse {
  @Field()
  message: string;
}
