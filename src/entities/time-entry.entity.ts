import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { ObjectType, Field, ID, InputType } from 'type-graphql';

import { entities } from '../config/constants';
import { timeEntry } from '../config/db/columns';
import { Base } from './base.entity';
import Company from './company.entity';
import User from './user.entity';
import Project from './project.entity';
import Task from './task.entity';
import { PagingInput, PagingResult, DeleteInput } from './common.entity';

const indexPrefix = 'time_entries';

@ObjectType()
@Entity({ name: entities.timeEntry })
export default class TimeEntry extends Base {
  @Index(`${indexPrefix}_start_index`)
  @Field()
  @Column()
  start: Date;

  @Index(`${indexPrefix}_end_index`)
  @Field({ nullable: true })
  @Column({ nullable: true })
  end: Date;

  @Field({ nullable: true })
  @Column({ nullable: true, type: 'int' })
  duration: number;

  @Field({ nullable: true })
  @Column({ name: 'client_location', nullable: true })
  clientLocation: string;

  @Index(`${indexPrefix}_project_id_index`)
  @Field()
  @Column()
  project_id: string;

  @Field((type) => Project)
  @ManyToOne(() => Project)
  @JoinColumn({ name: timeEntry.project_id })
  project: Project;

  @Field({ nullable: true })
  @Column({ nullable: true })
  approver_id: string;

  @Field((type) => User, { nullable: true })
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: timeEntry.approver_id })
  approver: User;

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

  @Index(`${indexPrefix}_task_id_index`)
  @Field()
  @Column()
  task_id: string;

  @Field((type) => Task)
  @ManyToOne(() => Task)
  @JoinColumn({ name: timeEntry.task_id })
  task: Task;
}

@ObjectType()
export class TimeEntryPagingResult {
  @Field()
  paging: PagingResult;

  @Field(() => [TimeEntry])
  data: TimeEntry[];
}

@InputType()
export class TimeEntryCreateInput {
  @Field()
  start: Date;

  @Field({ nullable: true })
  end: Date;

  @Field({ nullable: true })
  clientLocation: string;

  @Field()
  project_id: string;

  @Field()
  company_id: string;

  @Field()
  task_id: string;
}

@InputType()
export class TimeEntryUpdateInput {
  @Field()
  id: string;

  @Field({ nullable: true })
  start: Date;

  @Field({ nullable: true })
  end: Date;

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
  task_id: string;
}

@InputType()
export class TimeEntryStopInput {
  @Field()
  id: string;

  @Field()
  end: Date;

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
  task_id: string;

  @Field({ nullable: true })
  project_id: string;

  @Field({ nullable: true })
  afterStart: string;

  @Field({ nullable: true })
  beforeEnd: string;
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

  @Field((type) => [String], {
    nullable: true,
    description: 'Sort order. Default by start.',
    defaultValue: 'start:DESC',
  })
  order?: string[];

  @Field({ nullable: true })
  start: Date;

  @Field({ nullable: true })
  end: Date;
}

@InputType()
export class TimeEntryDeleteInput extends DeleteInput {
  @Field()
  company_id: string;
}
