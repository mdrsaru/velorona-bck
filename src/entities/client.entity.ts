import { Entity, Column, JoinColumn, OneToOne, ManyToOne, Index, OneToMany } from 'typeorm';
import { ObjectType, Field, ID, InputType, registerEnumType } from 'type-graphql';

import Company from './company.entity';
import Address, { AddressInput } from './address.entity';
import InvoicePaymentConfig from './invoice-payment-config.entity';
import { Base } from './base.entity';
import { entities, ClientStatus, InvoiceSchedule } from '../config/constants';
import { PagingResult, PagingInput, DeleteInput } from './common.entity';
import { AddressCreateInput, AddressUpdateInput } from './address.entity';

registerEnumType(ClientStatus, {
  name: 'ClientStatus',
});

registerEnumType(InvoiceSchedule, {
  name: 'InvoiceSchedule',
});

const indexPrefix = 'client';

@Entity({ name: entities.clients })
@ObjectType()
export default class Client extends Base {
  @Index(`${indexPrefix}_name_index`)
  @Field()
  @Column()
  name: string;

  @Index(`${indexPrefix}_email_index`)
  @Field()
  @Column()
  email: string;

  @Index(`${indexPrefix}_invoicing_email_index`)
  @Field({ nullable: true })
  @Column({ nullable: true })
  invoicingEmail: string;

  @Index(`${indexPrefix}_archived_index`)
  @Field()
  @Column({ default: false })
  archived: boolean;

  @Field((type) => ClientStatus)
  @Column({
    type: 'varchar',
    default: ClientStatus.Active,
  })
  status: ClientStatus;

  @Field()
  @Column()
  address_id: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  phone: string;

  @Field()
  @JoinColumn({ name: 'address_id' })
  @ManyToOne(() => Address, {
    cascade: true,
  })
  address: Address;

  @Index(`${indexPrefix}_company_id_index`)
  @Field()
  @Column()
  company_id: string;

  @Field((type) => Company)
  @ManyToOne(() => Company)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @Field(() => InvoiceSchedule, { nullable: true })
  @Column({ type: 'varchar', name: 'invoice_schedule', nullable: true })
  invoiceSchedule: InvoiceSchedule;

  @Field(() => InvoicePaymentConfig, { nullable: true })
  @JoinColumn({ name: 'invoice_payment_config_id' })
  @ManyToOne(() => InvoicePaymentConfig, { nullable: true })
  invoicePayment: InvoicePaymentConfig;

  @Field({ nullable: true })
  @Column({ nullable: true })
  invoice_payment_config_id: string;

  @Field({ nullable: true })
  @Column({
    name: 'schedule_start_date',
    type: 'date',
    nullable: true,
  })
  scheduleStartDate: string;
}

@ObjectType()
export class ClientPagingResult {
  @Field()
  paging: PagingResult;

  @Field(() => [Client])
  data: Client[];
}

@InputType()
export class ClientCreateInput {
  @Field()
  name: string;

  @Field()
  email: string;

  @Field({ nullable: true })
  invoicingEmail: string;

  @Field({ nullable: true })
  archived: boolean;

  @Field((type) => ClientStatus, { nullable: true })
  status: ClientStatus;

  @Field()
  address: AddressInput;

  @Field()
  company_id: string;

  @Field()
  phone: string;

  @Field({ nullable: true })
  invoiceSchedule: InvoiceSchedule;

  @Field({ nullable: true })
  invoice_payment_config_id: string;

  @Field({ nullable: true })
  scheduleStartDate: string;
}

@InputType()
export class ClientUpdateInput {
  @Field()
  id: string;

  @Field()
  company_id: string;

  @Field({ nullable: true })
  name: string;

  @Field({ nullable: true })
  archived: boolean;

  @Field((type) => ClientStatus, { nullable: true })
  status: ClientStatus;

  @Field({ nullable: true })
  invoicingEmail: string;

  @Field({ nullable: true })
  address: AddressInput;

  @Field({ nullable: true })
  phone: string;

  @Field({ nullable: true })
  invoiceSchedule: InvoiceSchedule;

  @Field({ nullable: true })
  invoice_payment_config_id: string;

  @Field({ nullable: true })
  scheduleStartDate: string;
}

@InputType()
export class ClientQuery {
  @Field({ nullable: true })
  id: string;

  @Field()
  company_id: string;

  @Field({ nullable: true })
  search: string;

  @Field({ nullable: true, defaultValue: false })
  archived: boolean;

  @Field({ nullable: true })
  status: string;
}

@InputType()
export class ClientQueryInput {
  @Field({ nullable: true })
  paging: PagingInput;

  @Field()
  query: ClientQuery;
}

@InputType()
export class ClientDeleteInput extends DeleteInput {
  @Field()
  company_id: string;
}

@InputType()
export class ClientCountInput {
  @Field()
  company_id: string;

  @Field({ nullable: true, defaultValue: false })
  archived: string;
}
