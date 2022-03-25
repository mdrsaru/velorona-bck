import { Entity, Column, ManyToOne } from 'typeorm';
import { ObjectType, Field, InputType, registerEnumType } from 'type-graphql';

import { entities, InvitationStatus } from '../config/constants';
import { Base } from './base.entity';
import User from './user.entity';
import Client from './client.entity';
import { PagingInput, PagingResult } from './common.entity';

registerEnumType(InvitationStatus, {
  name: 'InvitationStatus',
});

@ObjectType()
@Entity({ name: entities.invitation })
export default class Invitation extends Base {
  @Field()
  @Column()
  email: string;

  @Field()
  @Column()
  client_id: string;

  @Field((type) => Client)
  @ManyToOne(() => Client)
  client: Client;

  @Field()
  @Column()
  inviter_id: string;

  @Field((type) => User)
  @ManyToOne(() => User)
  inviter: User;

  @Field()
  @Column()
  token: string;

  @Field((type) => InvitationStatus)
  @Column({
    type: 'enum',
    enum: InvitationStatus,
  })
  status: InvitationStatus;
}

@ObjectType()
export class InvitationPagingResult {
  @Field()
  paging: PagingResult;

  @Field(() => [Invitation])
  data: Invitation[];
}

@InputType()
export class InvitationCreateInput {
  @Field()
  email: string;

  @Field()
  client_id: string;
}

@InputType()
export class InvitationQuery {
  @Field({ nullable: true })
  id: string;

  @Field()
  client_id: string;

  @Field({ nullable: true })
  inviter_id: string;
}

@InputType()
export class InvitationQueryInput {
  @Field({ nullable: true })
  paging: PagingInput;

  @Field()
  query: InvitationQuery;
}
