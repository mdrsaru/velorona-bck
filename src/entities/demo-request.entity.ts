import { Entity, Column, JoinColumn, OneToOne, ManyToOne, Index, OneToMany } from 'typeorm';
import { ObjectType, Field, ID, InputType, registerEnumType } from 'type-graphql';

import { Base } from './base.entity';
import { entities, DemoRequestStatus } from '../config/constants';
import { PagingResult, PagingInput, DeleteInput } from './common.entity';

registerEnumType(DemoRequestStatus, {
  name: 'DemoRequestStatus',
});

const indexPrefix = entities.demoRequest;

@Entity({ name: entities.demoRequest })
@ObjectType()
export default class DemoRequest extends Base {
  @Field()
  @Column({ name: 'full_name' })
  fullName: string;

  @Index(`${indexPrefix}_email`)
  @Field()
  @Column()
  email: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  phone: string;

  @Field({ nullable: true })
  @Column({ name: 'job_title', nullable: true })
  jobTitle: string;

  @Field({ nullable: true })
  @Column({ name: 'company_name', nullable: true })
  companyName: string;

  @Field(() => DemoRequestStatus)
  @Column({ type: 'varchar', default: 'Pending' })
  status: DemoRequestStatus;
}

@ObjectType()
export class DemoRequestPagingResult {
  @Field()
  paging: PagingResult;

  @Field(() => [DemoRequest])
  data: DemoRequest[];
}

@InputType()
export class DemoRequestCreateInput {
  @Field()
  fullName: string;

  @Field()
  email: string;

  @Field({ nullable: true })
  phone: string;

  @Field({ nullable: true })
  jobTitle: string;

  @Field({ nullable: true })
  companyName: string;
}

@InputType()
export class DemoRequestUpdateInput {
  @Field()
  id: string;

  @Field(() => DemoRequestStatus)
  status: DemoRequestStatus;
}

@InputType()
export class DemoRequestQuery {
  @Field({ nullable: true })
  id: string;

  @Field({ nullable: true })
  email: string;
}

@InputType()
export class DemoRequestQueryInput {
  @Field({ nullable: true })
  paging: PagingInput;

  @Field({ nullable: true })
  query: DemoRequestQuery;
}
