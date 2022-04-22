import { Field, InputType, ObjectType } from 'type-graphql';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { entities } from '../config/constants';
import { Base } from './base.entity';
import { PagingInput, PagingResult } from './common.entity';

@Entity({ name: entities.addresses })
@ObjectType()
export default class Address extends Base {
  @Field()
  @Column({ name: 'street_address' })
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

  //@Field()
  //@Column({ nullable: true })
  //user_id: string;

  //@OneToOne(() => User, (user) => user.address)
  //@JoinColumn({ name: 'user_id' })
  //user: User;
}

@ObjectType()
export class AddressPagingResult {
  @Field()
  paging: PagingResult;

  @Field(() => [Address])
  data: Address[];
}

@InputType()
export class AddressCreateInput {
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
export class AddressUpdateInput {
  @Field({ nullable: true })
  id: string;

  @Field({ nullable: true })
  streetAddress: string;

  @Field({ nullable: true })
  aptOrSuite: string;

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
}

@InputType()
export class AddressQueryInput {
  @Field({ nullable: true })
  paging: PagingInput;

  @Field({ nullable: true })
  query: AddressQuery;
}
