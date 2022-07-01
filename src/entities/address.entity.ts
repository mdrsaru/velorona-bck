import { Field, InputType, ObjectType } from 'type-graphql';
import { Column, Entity, Index, JoinColumn, OneToOne } from 'typeorm';
import { entities } from '../config/constants';
import { Base } from './base.entity';
import { PagingInput, PagingResult } from './common.entity';

const indexPrefix = 'address';
@Entity({ name: entities.addresses })
@ObjectType()
export default class Address extends Base {
  @Field()
  @Column({ name: 'street_address', nullable: true })
  streetAddress: string;

  @Field({ nullable: true })
  @Column({ nullable: true, name: 'apt_or_suite' })
  aptOrSuite: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  city: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  state: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  zipcode: string;

  @Index(`${indexPrefix}_country`)
  @Field({ nullable: true })
  @Column({ nullable: true, length: 70 })
  country: string;
}

@ObjectType()
export class AddressPagingResult {
  @Field()
  paging: PagingResult;

  @Field(() => [Address])
  data: Address[];
}

@InputType()
export class AddressInput {
  @Field({ nullable: true })
  country: string;

  @Field()
  country: string;

  @Field()
  streetAddress: string;

  @Field({ nullable: true })
  aptOrSuite: string;

  @Field()
  city: string;

  @Field()
  state: string;

  @Field()
  zipcode: string;
}

@InputType()
export class AddressCreateInput extends AddressInput {}

@InputType()
export class AddressUpdateInput extends AddressInput {
  @Field({ nullable: true })
  id: string;

  @Field({ nullable: true })
  country: string;

  @Field({ nullable: true })
  streetAddress: string;

  @Field({ nullable: true })
  city: string;

  @Field({ nullable: true })
  state: string;

  @Field({ nullable: true })
  zipcode: string;
}

@InputType()
export class AddressQuery {
  @Field({ nullable: true })
  id: string;

  @Field({ nullable: true })
  country: string;
}

@InputType()
export class AddressQueryInput {
  @Field({ nullable: true })
  paging: PagingInput;

  @Field({ nullable: true })
  query: AddressQuery;
}
