import { Entity, Column, ManyToOne, Index, JoinColumn } from 'typeorm';
import { ObjectType, Field, InputType, registerEnumType } from 'type-graphql';

import { entities, InvitationStatus, Role as RoleEnum } from '../config/constants';
import { Base } from './base.entity';
import User from './user.entity';
import Company from './company.entity';
import { PagingInput, PagingResult } from './common.entity';

registerEnumType(InvitationStatus, {
  name: 'InvitationStatus',
});

registerEnumType(RoleEnum, {
  name: 'Role',
});

@ObjectType()
@Entity({ name: entities.invitations })
export default class Invitation extends Base {
  @Index()
  @Field()
  @Column()
  email: string;

  @Index()
  @Field()
  @Column()
  company_id: string;

  @Field((type) => Company)
  @ManyToOne(() => Company)
  @JoinColumn({ name: 'company_id' })
  company: Company;

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
  @Column({ name: 'expires_in' })
  expiresIn: Date;

  @Field((type) => RoleEnum)
  @Column({
    type: 'varchar',
  })
  role: RoleEnum;

  @Field((type) => InvitationStatus)
  @Column({
    type: 'varchar',
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
  company_id: string;
}

@InputType()
export class InvitationRenewInput {
  @Field()
  id: string;

  @Field()
  company_id: string;
}

@InputType()
export class InvitationQuery {
  @Field({ nullable: true })
  id: string;

  @Field()
  company_id: string;

  @Field((type) => RoleEnum, { nullable: true })
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
