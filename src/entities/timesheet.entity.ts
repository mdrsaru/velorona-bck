import { times } from 'lodash';
import { Field, InputType, ObjectType, registerEnumType } from 'type-graphql';
import { Column, Entity, Index, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { GraphQLJSON } from 'graphql-type-json';

import { entities, TimeEntryApprovalStatus } from '../config/constants';
import { timesheet } from '../config/db/columns';
import { Base } from './base.entity';
import Client from './client.entity';
import TimeEntry from './time-entry.entity';
import { PagingInput, PagingResult } from './common.entity';
import Company from './company.entity';
import User from './user.entity';

registerEnumType(TimeEntryApprovalStatus, {
  name: 'TimesheetStatus',
});

const indexPrefix = entities.timesheet;

@ObjectType({ description: 'Time entries grouped by invoice_id' })
export class InvoicedTimeEntry {
  @Field()
  invoice_id: string;

  @Field((type) => [TimeEntry])
  entries: TimeEntry[];
}

@ObjectType({ description: 'Time entries grouped by statuses' })
export class StatusTimeEntry {
  @Field()
  approvalStatus: string;

  @Field((type) => [TimeEntry])
  entries: TimeEntry[];
}

@ObjectType({ description: 'Time entries grouped by statuses' })
export class TimeEntryGroupByStatusInvoice {
  @Field((type) => [InvoicedTimeEntry])
  byInvoice: InvoicedTimeEntry[];

  @Field((type) => [StatusTimeEntry])
  byStatus: StatusTimeEntry[];
}

// Typeorm Entity
@ObjectType()
@Entity({ name: entities.timesheet })
@Unique(`unique_user_${indexPrefix}`, ['user_id', 'client_id', 'weekStartDate', 'weekEndDate'])
export default class Timesheet extends Base {
  @Index(`${indexPrefix}_week_start_date_index`)
  @Field()
  @Column({
    name: timesheet.week_start_date,
    type: 'date',
  })
  weekStartDate: string;

  @Index(`${indexPrefix}_week_end_date_index`)
  @Field({ nullable: true })
  @Column({
    nullable: true,
    name: timesheet.week_end_date,
    type: 'date',
  })
  weekEndDate: string;

  @Field({ nullable: true, description: 'Weekly total time entries in seconds' })
  @Column({ nullable: true, type: 'int', name: timesheet.duration })
  duration: number;

  @Field({ nullable: true, description: 'Weekly duration format in HH:mm:ss' })
  durationFormat: string;

  @Field({ nullable: true })
  @Column({ name: timesheet.total_expense, type: 'float', nullable: true })
  totalExpense: number;

  @Field({
    nullable: true,
    description: 'Total duration for the invoiced time entries',
  })
  @Column({
    name: timesheet.invoiced_duration,
    type: 'int',
    nullable: true,
    default: 0,
  })
  invoicedDuration: number;

  @Field({ nullable: true, description: 'Invoiced duration format in HH:mm:ss' })
  invoicedDurationFormat: string;

  @Field((type) => TimeEntryApprovalStatus)
  @Column({
    type: 'varchar',
    default: TimeEntryApprovalStatus.Pending,
  })
  status: TimeEntryApprovalStatus;

  @Index(`${indexPrefix}_company_id_index`)
  @Field()
  @Column()
  company_id: string;

  @Field((type) => Company)
  @ManyToOne(() => Company)
  @JoinColumn({ name: timesheet.company_id })
  company: Company;

  @Index(`${indexPrefix}_user_id_index`)
  @Field()
  @Column()
  user_id: string;

  @Field((type) => User)
  @ManyToOne(() => User)
  @JoinColumn({ name: timesheet.user_id })
  user: User;

  @Index(`${indexPrefix}_client_id_index`)
  @Field()
  @Column()
  client_id: string;

  @Field((type) => Client)
  @ManyToOne(() => Client)
  @JoinColumn({ name: timesheet.client_id })
  client: Client;

  @Field()
  @Column({ nullable: true })
  approver_id: string;

  @Field((type) => User, { nullable: true })
  @ManyToOne(() => User)
  @JoinColumn({ name: timesheet.approver_id })
  approver: User;

  @Field({ nullable: true })
  @Column({
    name: timesheet.last_approved_at,
    nullable: true,
  })
  lastApprovedAt: Date;

  @Field({ nullable: true })
  @Column({
    name: timesheet.last_submitted_at,
    nullable: true,
  })
  lastSubmittedAt: Date;

  @Field({ nullable: true })
  @Column({
    name: timesheet.is_submitted,
    default: false,
  })
  isSubmitted: boolean;

  @Field((type) => [ProjectItem], {
    nullable: true,
    description: `
      List of projects related to time entries of a user along with the total duration, hourly rate and total expense
      Query this field only for the single timesheet as there will be N+1 problem for list of timesheet. 
    `,
  })
  projectItems: ProjectItem[];

  @Field((type) => GraphQLJSON, {
    nullable: true,
    description: `
      Maps each day of the time entry with its total duration
      Query this field only for the single timesheet as there will be N+1 problem for list of timesheet. 
    `,
  })
  durationMap: object;

  @Field((type) => [TimeEntry], {
    nullable: true,
    description: `
      List of weekly time entries of the particular timesheet
      Query this field only for the single timesheet as there will be N+1 problem for list of timesheet. 
    `,
  })
  timeEntries: TimeEntry[];

  @Field((type) => TimeEntryGroupByStatusInvoice, {
    nullable: true,
    description: `
      List of weekly time entries of the particular timesheet grouped by statuses and invoice_id
      Query this field only for the single timesheet as there will be N+1 problem for list of timesheet. 
    `,
  })
  entriesGroup: TimeEntryGroupByStatusInvoice;
}

@ObjectType({ description: 'Projects related to timesheet with total duration and expense' })
export class ProjectItem {
  @Field()
  project_id: string;

  @Field({ description: 'Total duration in hours' })
  totalHours: number;

  @Field()
  totalDuration: number;

  @Field()
  hourlyRate: number;

  @Field()
  totalExpense: number;
}

@InputType()
export class TimesheetApproveRejectInput {
  @Field()
  id: string;

  @Field()
  company_id: string;

  @Field((type) => TimeEntryApprovalStatus)
  status: TimeEntryApprovalStatus;
}

@InputType()
export class TimesheetSubmitInput {
  @Field()
  id: string;

  @Field()
  company_id: string;
}

@ObjectType()
export class TimeSheetPagingResult {
  @Field()
  paging: PagingResult;

  @Field(() => [Timesheet])
  data: Timesheet[];
}

@InputType()
export class TimesheetQuery {
  @Field({ nullable: true })
  id: string;

  @Field({ nullable: true })
  client_id: string;

  @Field({ nullable: true })
  user_id: string;

  @Field()
  company_id: string;
}

@InputType()
export class TimesheetQueryInput {
  @Field({ nullable: true })
  paging: PagingInput;

  @Field()
  query: TimesheetQuery;
}
