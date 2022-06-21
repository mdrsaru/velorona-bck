import { Entity, Column, JoinColumn, OneToOne, ManyToOne, Index, OneToMany } from 'typeorm';
import { ObjectType, Field, ID, InputType, registerEnumType } from 'type-graphql';

import Company from './company.entity';
import Address, { AddressInput } from './address.entity';
import { Base } from './base.entity';
import { entities, ClientStatus } from '../config/constants';
import { PagingResult, PagingInput, DeleteInput } from './common.entity';
import { AddressCreateInput, AddressUpdateInput } from './address.entity';

registerEnumType(ClientStatus, {
  name: 'ClientStatus',
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

  @Field()
  @Column()
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

  @Field()
  invoicingEmail: string;

  @Field({ nullable: true })
  archived: boolean;

  @Field((type) => ClientStatus, { nullable: true })
  status: ClientStatus;

  @Field()
  address: AddressInput;

  @Field()
  company_id: string;
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
  address: AddressInput;
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
