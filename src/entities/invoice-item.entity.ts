import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { ObjectType, Field, registerEnumType, InputType, Float } from 'type-graphql';

import { entities } from '../config/constants';
import { invoiceItems } from '../config/db/columns';
import { Base } from './base.entity';
import Invoice from './invoice.entity';
import Project from './project.entity';

const indexPrefix = 'invoice_items';

@ObjectType()
@Entity({ name: entities.invoiceItems })
export default class InvoiceItem extends Base {
  @Index(`${indexPrefix}_invoice_id`)
  @Field()
  @Column()
  invoice_id: string;

  @Field((type) => Invoice)
  @ManyToOne(() => Invoice)
  @JoinColumn({
    name: invoiceItems.invoice_id,
  })
  invoice: Invoice;

  @Index(`${indexPrefix}_project_id`)
  @Field()
  @Column()
  project_id: string;

  @Field()
  @ManyToOne(() => Project)
  @JoinColumn({
    name: invoiceItems.project_id,
  })
  project: Project;

  @Field((type) => Float)
  @Column({
    type: 'float',
  })
  hours: number;

  @Field((type) => Float)
  @Column({
    type: 'float',
  })
  rate: number;

  @Field((type) => Float)
  @Column({
    type: 'float',
  })
  amount: number;
}

@InputType()
export class InvoiceItemCreateInput {
  @Field()
  project_id: string;

  @Field((type) => Float)
  hours: number;

  @Field((type) => Float)
  rate: number;

  @Field((type) => Float)
  amount: number;
}

@InputType()
export class InvoiceItemUpdateInput {
  @Field()
  id: string;

  @Field()
  project_id: string;

  @Field((type) => Float)
  hours: number;

  @Field((type) => Float)
  rate: number;

  @Field((type) => Float)
  amount: number;
}
