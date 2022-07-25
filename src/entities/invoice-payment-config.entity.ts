import { Entity, Column, Index } from 'typeorm';
import { ObjectType, Field, ID, InputType } from 'type-graphql';

import { Base } from './base.entity';
import { entities } from '../config/constants';
import { PagingResult, PagingInput, DeleteInput } from './common.entity';

const indexPrefix = entities.invoicePaymentConfig;

@Entity({ name: entities.invoicePaymentConfig })
@ObjectType()
export default class InvoicePaymentConfig extends Base {
  @Field()
  @Column()
  name: string;

  @Index(`${indexPrefix}_days`)
  @Field()
  @Column()
  days: number;
}

@ObjectType()
export class InvoicePaymentConfigPagingResult {
  @Field()
  paging: PagingResult;

  @Field(() => [InvoicePaymentConfig])
  data: InvoicePaymentConfig[];
}

@InputType()
export class InvoicePaymentConfigCreateInput {
  @Field()
  name: string;

  @Field()
  days: number;
}

@InputType()
export class InvoicePaymentConfigUpdateInput {
  @Field()
  id: string;

  @Field()
  name: string;

  @Field()
  days: number;
}

@InputType()
export class InvoicePaymentConfigQuery {
  @Field({ nullable: true })
  id: string;

  @Field({ nullable: true })
  days: number;
}

@InputType()
export class InvoicePaymentConfigQueryInput {
  @Field({ nullable: true })
  paging: PagingInput;

  @Field({ nullable: true })
  query: InvoicePaymentConfigQuery;
}
