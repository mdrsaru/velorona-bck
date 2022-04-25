import { Entity, Column, ManyToOne, JoinColumn, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ObjectType, Field, registerEnumType, InputType } from 'type-graphql';

import User from './user.entity';
import Client from './client.entity';
import { Base } from './base.entity';
import { usersClients } from '../config/db/columns';
import { UserClientStatus, entities } from '../config/constants';

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
export class UserClientMakeInactiveInput {
  @Field()
  user_id: string;

  @Field({ description: 'Company user and client belongs to.' })
  company_id: string;
}
