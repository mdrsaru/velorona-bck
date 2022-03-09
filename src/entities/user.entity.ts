import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ObjectType, Field, ID, InputType, registerEnumType } from 'type-graphql';

import { Base } from './base.entity';
import Client from './client.entity';
import { entities, UserStatus } from '../config/constants';
import { PagingInput, PagingResult } from './common.entity';

registerEnumType(UserStatus, {
  name: 'UserStatus',
});

@ObjectType()
@Entity({ name: entities.users })
export default class User extends Base {
  @Field()
  @Column({ length: 64 })
  email: string;

  @Column()
  password: string;

  @Field()
  @Column({ length: 10 })
  phone: string;

  @Field()
  @Column({ length: 25, nullable: true })
  firstName: string;

  @Field({ nullable: true })
  @Column({ length: 25, nullable: true })
  middleName: string;

  @Field()
  @Column({ length: 25 })
  lastName: string;

  @Field((type) => UserStatus)
  @Column({
    type: 'enum',
    enum: UserStatus,
  })
  status: UserStatus;

  @ManyToOne(() => Client, (client) => client.users)
  @JoinColumn({ name: 'client_id' })
  client_id: string;
}

@ObjectType()
export class UserPagingResult {
  @Field()
  paging: PagingResult;

  @Field(() => [User])
  data: User[];
}

@InputType()
export class UserCreateInput {
  @Field()
  email: string;

  @Field()
  password: string;

  @Field()
  phone: string;

  @Field()
  firstName: string;

  @Field({ nullable: true })
  middleName: string;

  @Field()
  lastName: string;

  @Field((type) => UserStatus)
  status: UserStatus;

  @Field({ nullable: true })
  client_id: string;
}

@InputType()
export class UserUpdateInput {
  @Field()
  id: string;

  @Field({ nullable: true })
  email: string;

  @Field({ nullable: true })
  phone: string;

  @Field({ nullable: true })
  firstName: string;

  @Field({ nullable: true })
  middleName: string;

  @Field({ nullable: true })
  lastName: string;

  @Field((type) => UserStatus, { nullable: true })
  status: UserStatus;
}

@InputType()
export class UserQuery {
  @Field({ nullable: true })
  id: string;
}

@InputType()
export class UserQueryInput {
  @Field({ nullable: true })
  paging: PagingInput;

  @Field({ nullable: true })
  query: UserQuery;
}
