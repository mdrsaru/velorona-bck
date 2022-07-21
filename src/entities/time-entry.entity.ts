import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { ObjectType, Field, ID, InputType, registerEnumType } from 'type-graphql';

import { entities, TimeEntryApprovalStatus, UserType } from '../config/constants';
import { timeEntry } from '../config/db/columns';
import { Base } from './base.entity';
import Company from './company.entity';
import User from './user.entity';
import Project from './project.entity';
import Invoice from './invoice.entity';
import Timesheet from './timesheet.entity';
import { PagingInput, PagingResult, DeleteInput } from './common.entity';

registerEnumType(TimeEntryApprovalStatus, {
  name: 'TimeEntryApprovalStatus',
});

registerEnumType(UserType, {
  name: 'EntryType',
});

const indexPrefix = 'time_entries';

@ObjectType()
@Entity({ name: entities.timeEntry })
export default class TimeEntry extends Base {
  @Index(`${indexPrefix}_start_time_index`)
  @Field()
  @Column({ name: timeEntry.start_time })
  startTime: Date;

  @Index(`${indexPrefix}_end_time_index`)
  @Field({ nullable: true })
  @Column({ nullable: true, name: timeEntry.end_time })
  endTime: Date;

  @Field({ nullable: true })
  @Column({ nullable: true, type: 'int' })
  duration: number;

  @Field({ nullable: true })
  @Column({ name: timeEntry.client_location, nullable: true })
  clientLocation: string;

  @Index(`${indexPrefix}_project_id_index`)
  @Field()
  @Column()
  project_id: string;

  @Field((type) => Project)
  @ManyToOne(() => Project)
  @JoinColumn({ name: timeEntry.project_id })
  project: Project;

  @Index(`${indexPrefix}_company_id_index`)
  @Field()
  @Column()
  company_id: string;

  @Field((type) => Company)
  @ManyToOne(() => Company)
  @JoinColumn({ name: timeEntry.company_id })
  company: Company;

  @Index(`${indexPrefix}_created_by_index`)
  @Field()
  @Column()
  created_by: string;

  @Field((type) => User)
  @ManyToOne(() => User)
  @JoinColumn({ name: timeEntry.created_by })
  creator: User;

  @Field(() => TimeEntryApprovalStatus)
  @Column({
    type: 'varchar',
    name: timeEntry.approval_status,
    default: TimeEntryApprovalStatus.Pending,
  })
  approvalStatus: TimeEntryApprovalStatus;

  @Field()
  @Column({
    default: false,
  })
  submitted: boolean;

  @Field({ nullable: true })
  @Column({ nullable: true })
  invoice_id: string;

  @Field((type) => Invoice, { nullable: true })
  @ManyToOne(() => Invoice)
  @JoinColumn({ name: timeEntry.invoice_id })
  invoice: Invoice;

  @Field({ nullable: true })
  @Column({ nullable: true })
  approver_id: string;

  @Field((type) => User)
  @ManyToOne(() => User)
  @JoinColumn({ name: timeEntry.approver_id })
  approver: User;

  @Field({ nullable: true })
  @Column({ nullable: true })
  timesheet_id: string;

  @Field((type) => Timesheet, { nullable: true })
  @ManyToOne(() => Timesheet)
  @JoinColumn({ name: timeEntry.timesheet_id })
  timesheet: Timesheet;

  @Field()
  @Column({
    type: 'float',
    name: timeEntry.hourly_rate,
    default: 0,
  })
  hourlyRate: number;

  @Field(() => UserType)
  @Column({ name: 'entry_type', type: 'varchar', default: UserType.Timesheet })
  entryType: UserType;

  @Field({ nullable: true })
  @Column({ type: 'varchar', nullable: true })
  description: string;
}

@ObjectType()
export class TimeEntryPagingResult {
  @Field()
  paging: PagingResult;

  @Field(() => [TimeEntry])
  data: TimeEntry[];

  @Field(() => TimeEntry, { nullable: true })
  activeEntry: TimeEntry;
}

@InputType()
export class TimeEntryCreateInput {
  @Field()
  startTime: Date;

  @Field({ nullable: true })
  endTime: Date;

  @Field({ nullable: true })
  clientLocation: string;

  @Field()
  project_id: string;

  @Field()
  company_id: string;

  @Field({ nullable: true })
  description: string;
}

@InputType()
export class TimeEntryUpdateInput {
  @Field()
  id: string;

  @Field({ nullable: true })
  startTime: Date;

  @Field({ nullable: true })
  endTime: Date;

  @Field({ nullable: true })
  clientLocation: string;

  @Field({ nullable: true })
  project_id: string;

  @Field({ nullable: true })
  company_id: string;

  @Field({ nullable: true })
  approver_id: string;

  @Field({ nullable: true })
  created_by: string;

  @Field({ nullable: true })
  description: string;
}

@InputType()
export class TimeEntryStopInput {
  @Field()
  id: string;

  @Field()
  endTime: Date;

  @Field()
  company_id: string;
}

@InputType()
export class TimeEntryQuery {
  @Field({ nullable: true })
  id: string;

  @Field({ nullable: true })
  created_by: string;

  @Field()
  company_id: string;

  @Field({ nullable: true })
  project_id: string;

  @Field({ nullable: true })
  afterStart: string;

  @Field({ nullable: true })
  beforeEnd: string;

  @Field({ nullable: true, defaultValue: false, description: 'Filter null endTime data' })
  needActiveTimeEntry: boolean;

  @Field(() => UserType, { nullable: true, defaultValue: UserType.Timesheet })
  entryType: UserType;
}

@InputType()
export class TimeEntryQueryInput {
  @Field({ nullable: true })
  paging: PagingInput;

  @Field()
  query: TimeEntryQuery;
}

@InputType()
export class TimeEntryWeeklyDetailsInput {
  @Field()
  company_id: string;

  @Field({ nullable: true })
  created_by: string;

  @Field({ nullable: true })
  client_id: string;

  @Field((type) => [String], {
    nullable: true,
    description: 'Sort order. Default by start time.',
    defaultValue: 'startTime:DESC',
  })
  order?: string[];

  @Field({ nullable: true })
  startTime: Date;

  @Field({ nullable: true })
  endTime: Date;
}

@InputType()
export class TimeEntryDeleteInput extends DeleteInput {
  @Field()
  company_id: string;
}

@InputType()
export class TimeEntryBulkDeleteInput {
  @Field()
  company_id: string;

  @Field((type) => [String])
  ids: string[];

  @Field()
  created_by: string;

  @Field()
  client_id: string;
}

@InputType()
export class TimeEntryApproveRejectInput {
  @Field((type) => [String])
  ids: string[];

  @Field()
  timesheet_id: string;

  @Field()
  company_id: string;

  @Field()
  approvalStatus: TimeEntryApprovalStatus;
}

@InputType()
export class TimeEntryUnlockInput {
  @Field()
  timesheet_id: string;

  @Field()
  user_id: string;

  @Field()
  company_id: string;

  @Field()
  statusToUnlock: TimeEntryApprovalStatus;
}

@InputType()
export class TotalDurationCountInput {
  @Field()
  company_id: string;

  @Field({ nullable: true })
  user_id: string;

  @Field({ nullable: true })
  manager_id: string;
}
