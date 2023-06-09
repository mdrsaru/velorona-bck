import { Entity, Column, ManyToOne, JoinColumn, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ObjectType, Field, registerEnumType, InputType } from 'type-graphql';

import User from './user.entity';
import Client from './client.entity';
import { Base } from './base.entity';
import { usersClients } from '../config/db/columns';
import { UserClientStatus, entities } from '../config/constants';
import { PagingInput, PagingResult } from './common.entity';

registerEnumType(UserClientStatus, {
  name: 'UserClientStatus',
});

@ObjectType()
@Entity({ name: entities.usersClients })
export default class UserClient {
  @Field()
  @Column()
  status: UserClientStatus;

  @Field()
  @PrimaryColumn()
  user_id: string;

  @Field(() => User)
  @ManyToOne(() => User)
  @JoinColumn({ name: usersClients.user_id })
  user: User;

  @Field()
  @PrimaryColumn()
  client_id: string;

  @Field(() => Client)
  @ManyToOne(() => Client)
  @JoinColumn({ name: usersClients.client_id })
  client: Client;

  @Field()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

@InputType()
export class UserClientAssociateInput {
  @Field()
  user_id: string;

  @Field()
  client_id: string;

  @Field({ description: 'Company user and client belongs to.' })
  company_id: string;
}

@InputType()
export class UserClientChangeStatusInput {
  @Field()
  user_id: string;

  @Field({ description: 'Company user and client belongs to.' })
  company_id: string;

  @Field()
  client_id: string;

  @Field((type) => UserClientStatus, { nullable: true })
  status: UserClientStatus;
}

@ObjectType()
export class UserClientPagingResult {
  @Field()
  paging: PagingResult;

  @Field(() => [UserClient])
  data: UserClient[];
}

@InputType()
export class UserClientQuery {
  @Field({ nullable: true })
  id: string;

  @Field({ nullable: true })
  client_id: string;

  @Field({ nullable: true })
  user_id: string;

  @Field({ nullable: true })
  company_id: string;

  @Field({ nullable: true })
  status: string;
}

@InputType()
export class UserClientQueryInput {
  @Field({ nullable: true })
  paging: PagingInput;

  @Field()
  query: UserClientQuery;
}

@ObjectType()
export class UserClientDetail {
  @Field({ nullable: true })
  user_id: string;

  @Field({ nullable: true })
  clientName: string;

  @Field({ nullable: true })
  clientId: string;

  @Field({ nullable: true })
  projectName: string;

  @Field({ nullable: true })
  userRate: string;

  @Field({ nullable: true })
  invoiceRate: string;

  @Field({ nullable: true })
  status: string;

  @Field({ nullable: true })
  projectId: string;

  @Field({ nullable: true })
  userPayRateId: string;

  @Field({ nullable: true })
  invoiceRateCurrency: string;

  @Field({ nullable: true })
  userRateCurrency: string;

  @Field({ nullable: true })
  userProjectStatus: string;
}
