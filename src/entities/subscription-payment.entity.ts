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
  @Field(() => SubscriptionPaymentStatus)
  @Column({ type: 'varchar' })
  status: SubscriptionPaymentStatus;

  @Field()
  @Column({ name: 'payment_date' })
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

  @Field()
  company_id: string;
}

@InputType()
export class SubscriptionPaymentQueryInput {
  @Field({ nullable: true })
  paging: PagingInput;

  @Field()
  query: SubscriptionPaymentQuery;
}
