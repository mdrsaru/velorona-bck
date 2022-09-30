import { Field, InputType, ObjectType } from 'type-graphql';
import { Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm';

import { entities } from '../config/constants';
import { userPayRate } from '../config/db/columns';
import { Base } from './base.entity';
import { PagingInput, PagingResult } from './common.entity';
import Project from './project.entity';
import User from './user.entity';
import Currency from './currency.entity';

@ObjectType()
@Unique(['user_id', 'project_id'])
@Entity({ name: entities.userPayRate })
export default class UserPayRate extends Base {
  @Field()
  @Column({ name: userPayRate.start_date, nullable: true })
  startDate: Date;

  @Field()
  @Column({ name: userPayRate.end_date, nullable: true })
  endDate: Date;

  @Field()
  @Column({ nullable: true })
  user_rate_currency_id: string;

  @Field((type) => Currency, { nullable: true })
  @ManyToOne(() => Currency, { nullable: true })
  @JoinColumn({ name: userPayRate.user_rate_currency_id })
  userRateCurrency: Currency;

  @Field()
  @Column({ default: 0 })
  amount: number;

  @Field()
  @Column({ nullable: true })
  invoice_rate_currency_id: string;

  @Field((type) => Currency, { nullable: true })
  @ManyToOne(() => Currency, { nullable: true })
  @JoinColumn({ name: userPayRate.invoice_rate_currency_id })
  invoiceRateCurrency: Currency;

  @Field()
  @Column({ name: userPayRate.invoice_rate, default: 0 })
  invoiceRate: number;

  @Field()
  @Column()
  user_id: string;

  @Field((type) => User)
  @ManyToOne(() => User)
  @JoinColumn({ name: userPayRate.user_id })
  user: User;

  @Field()
  @Column()
  project_id: string;

  @Field((type) => Project)
  @ManyToOne(() => Project)
  @JoinColumn({ name: userPayRate.project_id })
  project: Project;
}

@InputType()
export class UserPayRateCreateInput {
  @Field({ nullable: true })
  startDate: Date;

  @Field({ nullable: true })
  endDate: Date;

  @Field({ nullable: true })
  amount: number;

  @Field()
  project_id: string;

  @Field()
  user_id: string;

  @Field({ nullable: true })
  invoiceRate: number;

  @Field()
  company_id: string;

  @Field({ nullable: true })
  user_rate_currency_id: string;

  @Field({ nullable: true })
  invoice_rate_currency_id: string;
}

@InputType()
export class UserPayRateUpdateInput {
  @Field()
  id: string;

  @Field({ nullable: true })
  startDate: Date;

  @Field({ nullable: true })
  endDate: Date;

  @Field({ nullable: true })
  amount: number;

  @Field({ nullable: true })
  project_id: string;

  @Field({ nullable: true })
  user_id: string;

  @Field({ nullable: true })
  invoiceRate: number;

  @Field({ nullable: true })
  user_rate_currency_id: string;

  @Field({ nullable: true })
  invoice_rate_currency_id: string;
}

@InputType()
export class UserPayRateQuery {
  @Field({ nullable: true })
  id: string;

  @Field({ nullable: true })
  project_id: string;

  @Field({ nullable: true })
  user_id: string;

  @Field({ nullable: true })
  company_id: string;
}

@InputType()
export class UserPayRateQueryInput {
  @Field({ nullable: true })
  paging: PagingInput;

  @Field()
  query: UserPayRateQuery;
}

@ObjectType()
export class UserPayRatePagingResult {
  @Field()
  paging: PagingResult;

  @Field(() => [UserPayRate])
  data: UserPayRate[];
}
