import { Entity, Column, ManyToOne, Index, JoinColumn } from 'typeorm';
import { ObjectType, Field, InputType, registerEnumType } from 'type-graphql';

import { entities, InvitationStatus, Role as RoleEnum } from '../config/constants';
import { Base } from './base.entity';
import User from './user.entity';
import Client from './client.entity';
import { PagingInput, PagingResult } from './common.entity';

registerEnumType(InvitationStatus, {
  name: 'InvitationStatus',
});

registerEnumType(RoleEnum, {
  name: 'Role',
});

@ObjectType()
@Entity({ name: entities.invitation })
export default class Invitation extends Base {
  @Index()
  @Field()
  @Column()
  email: string;

  @Index()
  @Field()
  @Column()
  client_id: string;

  @Field((type) => Client)
  @ManyToOne(() => Client)
  @JoinColumn({ name: 'client_id' })
  client: Client;

  @Field()
  @Column()
  inviter_id: string;

  @Field((type) => User)
  @ManyToOne(() => User)
  @JoinColumn({ name: 'inviter_id' })
  inviter: User;

  @Index()
  @Field()
  @Column({ unique: true })
  token: string;

  @Field()
  @Column()
  expiresIn: Date;

  @Field((type) => RoleEnum)
  @Column({
    type: 'enum',
    enum: RoleEnum,
  })
  role: RoleEnum;

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

  @Field((type) => RoleEnum)
  role: RoleEnum;

  @Field()
  client_id: string;
}

@InputType()
export class InvitationRenewInput {
  @Field()
  id: string;
}

@InputType()
export class InvitationQuery {
  @Field({ nullable: true })
  id: string;

  @Field()
  client_id: string;

  @Field((type) => RoleEnum)
  role: string;

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
