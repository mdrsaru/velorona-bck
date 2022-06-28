import { Field, InputType, ObjectType } from 'type-graphql';
import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, OneToOne } from 'typeorm';
import { entities } from '../config/constants';
import { Base } from './base.entity';
import { PagingInput, PagingResult } from './common.entity';
import Company from './company.entity';
import Media from './media.entity';

const indexPrefix = 'AttachedTimesheet';
@Entity({ name: entities.attachedTimesheet })
@ObjectType()
export default class AttachedTimesheet extends Base {
  @Index(`${indexPrefix}_date_index`)
  @Field()
  @Column()
  date: Date;

  @Field()
  @Column({ name: 'total_cost' })
  totalCost: Number;

  @Field({ nullable: true })
  @Column({ nullable: true })
  description: string;

  @Field()
  @Column()
  attachment_id: string;

  @Field(() => Media)
  @ManyToOne(() => Media)
  @JoinColumn({ name: 'attachment_id' })
  attachments: Media;

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
export class AttachedTimesheetPagingResult {
  @Field()
  paging: PagingResult;

  @Field(() => [AttachedTimesheet])
  data: AttachedTimesheet[];
}

@InputType()
export class AttachedTimesheetCreateInput {
  @Field()
  description: string;

  @Field({ nullable: true })
  date: Date;

  @Field()
  totalCost: number;

  @Field({ nullable: true })
  attachment_id: string;

  @Field()
  company_id: string;
}

@InputType()
export class AttachedTimesheetUpdateInput {
  @Field()
  id: string;

  @Field({ nullable: true })
  description: string;

  @Field({ nullable: true })
  date: Date;

  @Field({ nullable: true })
  totalCost: number;

  @Field({ nullable: true })
  attachment_id: string;

  @Field()
  company_id: string;
}

@InputType()
export class AttachedTimesheetQuery {
  @Field({ nullable: true })
  id: string;

  @Field()
  company_id: string;
}

@InputType()
export class AttachedTimesheetQueryInput {
  @Field({ nullable: true })
  paging: PagingInput;

  @Field({ nullable: true })
  query: AttachedTimesheetQuery;
}
