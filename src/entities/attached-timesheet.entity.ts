import { Field, InputType, ObjectType, registerEnumType } from 'type-graphql';
import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, OneToOne } from 'typeorm';
import { AttachedTimesheetStatus, entities } from '../config/constants';
import { attachedTimesheets } from '../config/db/columns';
import { Base } from './base.entity';
import { PagingInput, PagingResult } from './common.entity';
import Company from './company.entity';
import Invoice from './invoice.entity';
import Media from './media.entity';
import Timesheet from './timesheet.entity';
import User from './user.entity';

registerEnumType(AttachedTimesheetStatus, {
  name: 'AttachedTimesheetStatus',
});

const indexPrefix = 'Timesheet';
@Entity({ name: entities.timesheetAttachments })
@ObjectType()
export default class AttachedTimesheet extends Base {
  @Field()
  @Column()
  description: string;

  @Field()
  @Column()
  attachment_id: string;

  @Field(() => Media)
  @ManyToOne(() => Media)
  @JoinColumn({ name: attachedTimesheets.attachment_id })
  attachments: Media;

  @Index(`${indexPrefix}_company_id_index`)
  @Field()
  @Column()
  company_id: string;

  @Field((type) => Company)
  @ManyToOne(() => Company)
  @JoinColumn({ name: attachedTimesheets.company_id })
  company: Company;

  @Index(`${indexPrefix}_created_by_index`)
  @Field()
  @Column()
  created_by: string;

  @Field((type) => User)
  @ManyToOne(() => User)
  @JoinColumn({ name: attachedTimesheets.created_by })
  creator: User;

  @Index(`${indexPrefix}_timesheet_id_index`)
  @Field({ nullable: true })
  @Column({ nullable: true })
  timesheet_id: string;

  @Field((type) => Timesheet)
  @ManyToOne(() => Timesheet)
  @JoinColumn({ name: attachedTimesheets.timesheet_id })
  timesheet: Timesheet;

  @Index(`${indexPrefix}_invoice_id_index`)
  @Field({ nullable: true })
  @Column({ nullable: true })
  invoice_id: string;

  @Field((type) => Invoice)
  @ManyToOne(() => Invoice)
  @JoinColumn({ name: attachedTimesheets.invoice_id })
  invoice: Invoice;

  @Field((type) => AttachedTimesheetStatus)
  @Column({
    type: 'varchar',
    default: AttachedTimesheetStatus.Pending,
  })
  status: AttachedTimesheetStatus;
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

  @Field()
  attachment_id: string;

  @Field()
  company_id: string;

  @Field()
  timesheet_id: string;
}

@InputType()
export class AttachedTimesheetUpdateInput {
  @Field()
  id: string;

  @Field({ nullable: true })
  description: string;

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

  @Field({ nullable: true })
  created_by: string;

  @Field({ nullable: true })
  timesheet_id: string;
}

@InputType()
export class AttachedTimesheetQueryInput {
  @Field({ nullable: true })
  paging: PagingInput;

  @Field({ nullable: true })
  query: AttachedTimesheetQuery;
}
