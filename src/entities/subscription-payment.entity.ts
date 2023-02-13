import { string } from 'joi';
import { Field, ID, InputType, ObjectType, registerEnumType } from 'type-graphql';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { entities, SubscriptionPaymentStatus } from '../config/constants';
import { Base } from './base.entity';
import Company from './company.entity';
import { PagingInput, PagingResult } from './common.entity';

registerEnumType(SubscriptionPaymentStatus, {
  name: 'SubscriptionPaymentStatus',
});

const indexPrefix = entities.subscriptionPayments;

@Entity({ name: entities.subscriptionPayments })
@ObjectType()
export default class SubscriptionPayment extends Base {
  @Field()
  @Column({ type: 'varchar' })
  status: SubscriptionPaymentStatus;

  @Field({ nullable: true })
  @Column({ name: 'payment_date', nullable: true })
  paymentDate: Date;

  @Field()
  @Column({ type: 'float' })
  amount: number;

  @Index(`${indexPrefix}_company_id_index`)
  @Field()
  @Column()
  company_id: string;

  @Field((type) => Company)
  @ManyToOne(() => Company)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @Field({ nullable: true })
  @Column({ nullable: true, name: 'invoice_link' })
  invoiceLink: string;

  @Field({ nullable: true })
  @Column({ nullable: true, name: 'receipt_link' })
  receiptLink: string;

  @Field({ nullable: true })
  @Column({ nullable: true, name: 'period_start_date' })
  periodStartDate: string;

  @Field({ nullable: true })
  @Column({ nullable: true, name: 'period_end_date' })
  periodEndDate: string;

  @Field({ nullable: true })
  @Column({ nullable: true, name: 'invoice_id' })
  invoiceId: string;
}

@ObjectType()
export class SubscriptionPaymentPagingResult {
  @Field()
  paging: PagingResult;

  @Field(() => [SubscriptionPayment])
  data: SubscriptionPayment[];
}

@InputType()
export class SubscriptionPaymentQuery {
  @Field({ nullable: true })
  id: string;

  @Field({ nullable: true })
  company_id: string;

  @Field({ nullable: true })
  startDate: Date;

  @Field({ nullable: true })
  endDate: Date;

  @Field({ nullable: true })
  search: string;

  @Field({ nullable: true })
  status: string;

  @Field({ nullable: true })
  paymentDate: string;
}

@InputType()
export class SubscriptionPaymentQueryInput {
  @Field({ nullable: true })
  paging: PagingInput;

  @Field({ nullable: true })
  query: SubscriptionPaymentQuery;
}
