import {
  Index,
  Entity,
  Column,
  BaseEntity,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
  Generated,
  OneToMany,
} from 'typeorm';
import { ObjectType, Field, ID, InputType, registerEnumType } from 'type-graphql';

import { AttachmentType } from '../config/constants';
import { invoices } from '../config/db/columns';
import { Base } from './base.entity';
import Client from './client.entity';
import Company from './company.entity';
import InvoiceItem from './invoice-item.entity';
import Timesheet from './timesheet.entity';
import User from './user.entity';
import { entities, InvoiceStatus } from '../config/constants';
import { PagingResult, PagingInput } from './common.entity';
import { InvoiceItemCreateInput, InvoiceItemUpdateInput } from './invoice-item.entity';
import Attachment from './attached-timesheet.entity';

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
    type: 'varchar',
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
    name: invoices.issue_date,
  })
  issueDate: Date;

  @Field()
  @Column({
    name: invoices.due_date,
  })
  dueDate: Date;

  @Field()
  @Column({
    name: invoices.invoice_number,
  })
  @Generated('increment')
  invoiceNumber: number;

  @Field()
  @Column({
    name: invoices.po_number,
    nullable: true,
  })
  poNumber: string;

  @Field()
  @Column({
    name: invoices.total_quantity,
    type: 'float',
  })
  totalQuantity: number;

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
  @Column({
    type: 'float',
    nullable: true,
    default: 0,
  })
  taxAmount: number;

  @Field()
  @Column({ nullable: true })
  notes: string;

  @Index(`${indexPrefix}_company_id`)
  @Field()
  @Column()
  company_id: string;

  @Field((type) => Company)
  @ManyToOne(() => Company)
  @JoinColumn({ name: invoices.company_id })
  company: Company;

  @Index(`${indexPrefix}_client_id`)
  @Field()
  @Column()
  client_id: string;

  @Field((type) => Client)
  @ManyToOne(() => Client)
  @JoinColumn({ name: invoices.client_id })
  client: Client;

  @Field({ nullable: true })
  @Column({ nullable: true })
  timesheet_id: string;

  @Field((type) => Timesheet, { nullable: true })
  @ManyToOne(() => Timesheet)
  @JoinColumn({ name: invoices.timesheet_id })
  timesheet: Timesheet;

  @Field((type) => [InvoiceItem], { description: 'Invoice items' })
  @OneToMany(() => InvoiceItem, (item) => item.invoice)
  items: InvoiceItem[];

  @OneToMany(() => Attachment, (attachment) => attachment.invoice, { cascade: ['insert', 'update'] })
  attachments: Attachment[];

  @Field({ nullable: true })
  @Column({
    type: 'float',
    nullable: true,
    default: 0,
  })
  discount: number;

  @Field({ nullable: true })
  discountAmount: number;

  @Field({ nullable: true })
  @Column({
    type: 'float',
    nullable: true,
    default: 0,
  })
  shipping: number;

  @Field()
  @Column({
    name: 'need_project',
    default: true,
  })
  needProject: boolean;

  @Field()
  @Column({
    name: 'start_date',
    type: 'date',
    nullable: true,
  })
  startDate: string;

  @Field()
  @Column({
    name: 'end_date',
    type: 'date',
    nullable: true,
  })
  endDate: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  user_id: string;

  @Field((type) => User, {
    nullable: true,
    description: 'Employee id for the provided time entries',
  })
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;
}

@ObjectType()
export class InvoicePagingResult {
  @Field()
  paging: PagingResult;

  @Field(() => [Invoice])
  data: Invoice[];
}

@InputType()
export class AttachmentCreateInput {
  @Field()
  description: string;

  @Field()
  attachment_id: string;

  @Field()
  created_by: string;

  @Field((type) => AttachmentType)
  type: AttachmentType;

  @Field({ nullable: true })
  amount: number;

  @Field({ nullable: true })
  date: Date;
}

@InputType()
export class InvoiceCreateInput {
  @Field({ nullable: true })
  timesheet_id: string;

  @Field((type) => InvoiceStatus, { nullable: true })
  status: InvoiceStatus;

  @Field()
  issueDate: Date;

  @Field()
  dueDate: Date;

  @Field()
  poNumber: string;

  @Field()
  totalQuantity: number;

  @Field()
  subtotal: number;

  @Field()
  totalAmount: number;

  @Field({ nullable: true })
  taxPercent: number;

  @Field({ nullable: true })
  taxAmount: number;

  @Field({ nullable: true })
  notes: string;

  @Field()
  company_id: string;

  @Field()
  client_id: string;

  @Field({ nullable: true })
  discount: number;

  @Field({ nullable: true })
  shipping: number;

  @Field({ defaultValue: true })
  needProject: boolean;

  @Field({ nullable: true })
  user_id: string;

  @Field({ nullable: true })
  startDate: string;

  @Field({ nullable: true })
  endDate: string;

  @Field(() => [InvoiceItemCreateInput])
  items: InvoiceItemCreateInput[];

  @Field(() => [AttachmentCreateInput], { nullable: true })
  attachments: AttachmentCreateInput[];
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
  issueDate: Date;

  @Field({ nullable: true })
  dueDate: Date;

  @Field({ nullable: true })
  poNumber: string;

  @Field({ nullable: true })
  totalQuantity: number;

  @Field({ nullable: true })
  subtotal: number;

  @Field({ nullable: true })
  totalAmount: number;

  @Field({ nullable: true })
  taxPercent: number;

  @Field({ nullable: true })
  taxAmount: number;

  @Field({ nullable: true })
  notes: string;

  @Field({ nullable: true })
  discount: number;

  @Field({ nullable: true })
  shipping: number;

  @Field({ defaultValue: true })
  needProject: boolean;

  @Field((type) => [InvoiceItemUpdateInput], { nullable: true })
  items: InvoiceItemUpdateInput[];

  @Field({ nullable: true })
  sendEmail: boolean;
}

@InputType()
export class InvoicePDFInput {
  @Field()
  id: string;

  @Field()
  company_id: string;
}

@InputType()
export class InvoiceQuery {
  @Field({ nullable: true })
  id: string;

  @Field()
  company_id: string;

  @Field({ nullable: true })
  client_id: string;

  @Field({ nullable: true })
  search: string;

  @Field({ nullable: true })
  status: string;

  @Field({ nullable: true })
  issueDate: Date;

  @Field({ nullable: true })
  startDate: Date;

  @Field({ nullable: true })
  endDate: Date;
}

@InputType()
export class InvoiceQueryInput {
  @Field({ nullable: true })
  paging: PagingInput;

  @Field()
  query: InvoiceQuery;
}
