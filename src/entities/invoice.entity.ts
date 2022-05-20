import { Index, Entity, Column, BaseEntity, ManyToOne, JoinColumn, PrimaryGeneratedColumn, Generated } from 'typeorm';
import { ObjectType, Field, ID, InputType, registerEnumType } from 'type-graphql';

import { invoices } from '../config/db/columns';
import { Base } from './base.entity';
import Client from './client.entity';
import Company from './company.entity';
import InvoiceItem from './invoice-item.entity';
import { entities, InvoiceStatus } from '../config/constants';
import { PagingResult, PagingInput } from './common.entity';
import { InvoiceItemCreateInput, InvoiceItemUpdateInput } from './invoice-item.entity';

registerEnumType(InvoiceStatus, {
  name: 'InvoiceStatus',
});

const indexPrefix = 'invoices';

@Entity({ name: entities.invoices })
@ObjectType()
export default class Invoice extends Base {
  @Index(`${indexPrefix}_status`)
  @Field((type) => InvoiceStatus)
  @Column({
    type: 'enum',
    enum: InvoiceStatus,
    default: InvoiceStatus.Pending,
  })
  status: InvoiceStatus;

  @Field()
  @Column({
    default: false,
  })
  verified: boolean;

  @Field()
  @Column({
    name: invoices.sent_as_email,
    default: false,
  })
  sentAsEmail: boolean;

  @Field()
  @Column()
  date: Date;

  @Field()
  @Column({
    name: invoices.invoice_number,
  })
  @Generated('increment')
  invoiceNumber: number;

  @Field()
  @Column({
    name: invoices.payment_due,
  })
  paymentDue: Date;

  @Field()
  @Column({
    name: invoices.po_number,
  })
  poNumber: string;

  @Field()
  @Column({
    name: invoices.total_hours,
    type: 'float',
  })
  totalHours: number;

  @Field()
  @Column({
    name: invoices.subtotal,
    type: 'float',
  })
  subtotal: number;

  @Field()
  @Column({
    name: invoices.total_amount,
    type: 'float',
  })
  totalAmount: number;

  @Field()
  @Column({
    type: 'float',
    nullable: true,
  })
  taxPercent: number;

  @Field()
  @Column({ nullable: true })
  notes: string;

  @Index(`${indexPrefix}_company_id`)
  @Field()
  @Column()
  company_id: string;

  @Field()
  @ManyToOne(() => Company)
  @JoinColumn({ name: invoices.company_id })
  company: Company;

  @Index(`${indexPrefix}_client_id`)
  @Field()
  @Column()
  client_id: string;

  @Field()
  @ManyToOne(() => Client)
  @JoinColumn({ name: invoices.client_id })
  client: Client;

  @Field((type) => [InvoiceItem], { description: 'Invoice items' })
  items: InvoiceItem[];
}

@ObjectType()
export class InvoicePagingResult {
  @Field()
  paging: PagingResult;

  @Field(() => [Invoice])
  data: Invoice[];
}

@InputType()
export class InvoiceCreateInput {
  @Field((type) => InvoiceStatus, { nullable: true })
  status: InvoiceStatus;

  @Field()
  date: Date;

  @Field()
  paymentDue: Date;

  @Field()
  poNumber: string;

  @Field()
  totalHours: number;

  @Field()
  subtotal: number;

  @Field()
  totalAmount: number;

  @Field({ nullable: true })
  taxPercent: number;

  @Field({ nullable: true })
  notes: string;

  @Field()
  company_id: string;

  @Field()
  client_id: string;

  @Field(() => [InvoiceItemCreateInput])
  items: InvoiceItemCreateInput[];
}

@InputType()
export class InvoiceUpdateInput {
  @Field()
  id: string;

  @Field()
  company_id: string;

  @Field((type) => InvoiceStatus, { nullable: true })
  status: InvoiceStatus;

  @Field({ nullable: true })
  date: Date;

  @Field({ nullable: true })
  paymentDue: Date;

  @Field({ nullable: true })
  poNumber: string;

  @Field({ nullable: true })
  totalHours: number;

  @Field({ nullable: true })
  subtotal: number;

  @Field({ nullable: true })
  totalAmount: number;

  @Field({ nullable: true })
  taxPercent: number;

  @Field({ nullable: true })
  notes: string;

  @Field((type) => [InvoiceItemUpdateInput], { nullable: true })
  items: InvoiceItemUpdateInput[];
}

@InputType()
export class InvoiceQuery {
  @Field({ nullable: true })
  id: string;

  @Field()
  company_id: string;

  @Field({ nullable: true })
  client_id: string;
}

@InputType()
export class InvoiceQueryInput {
  @Field({ nullable: true })
  paging: PagingInput;

  @Field()
  query: InvoiceQuery;
}
