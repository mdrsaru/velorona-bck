import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ObjectType, Field, ID, InputType } from 'type-graphql';
import { entities } from '../config/constants';
import { timesheet } from '../config/db/columns';
import Company from './company.entity';
import User from './user.entity';
import Project from './project.entity';
import { Base } from './base.entity';
import { PagingInput, PagingResult } from './common.entity';
import Task from './task.entity';

@ObjectType()
@Entity({ name: entities.timesheet })
export default class Timesheet extends Base {
  @Field()
  @Column()
  start: Date;

  @Field({ nullable: true })
  @Column({ nullable: true })
  end: Date;

  @Field({ nullable: true })
  @Column({ name: 'client_location', nullable: true })
  clientLocation: string;

  @Field()
  @Column()
  project_id: string;

  @Field((type) => Project)
  @ManyToOne(() => Project)
  @JoinColumn({ name: timesheet.project_id })
  project: Project;

  @Field({ nullable: true })
  @Column({ nullable: true })
  approver_id: string;

  @Field((type) => User, { nullable: true })
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: timesheet.approver_id })
  approver: User;

  @Field()
  @Column()
  company_id: string;

  @Field((type) => Company)
  @ManyToOne(() => Company)
  @JoinColumn({ name: timesheet.company_id })
  company: Company;

  @Field()
  @Column()
  created_by: string;

  @Field((type) => User)
  @ManyToOne(() => User)
  @JoinColumn({ name: timesheet.created_by })
  creator: User;

  @Field()
  @Column()
  task_id: string;

  @Field((type) => Task)
  @ManyToOne(() => Task)
  @JoinColumn({ name: timesheet.task_id })
  task: Task;
}

@ObjectType()
export class TimesheetPagingResult {
  @Field()
  paging: PagingResult;

  @Field(() => [Timesheet])
  data: Timesheet[];
}

@InputType()
export class TimesheetCreateInput {
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
  created_by: string;

  @Field()
  task_id: string;
}

@InputType()
export class TimesheetUpdateInput {
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
export class StopTimesheetInput {
  @Field()
  id: string;

  @Field()
  end: Date;

  @Field()
  company_id: string;
}

@InputType()
export class TimesheetQuery {
  @Field({ nullable: true })
  id: string;

  @Field()
  company_id: string;

  @Field({ nullable: true })
  task_id: string;
}

@InputType()
export class TimesheetQueryInput {
  @Field({ nullable: true })
  paging: PagingInput;

  @Field()
  query: TimesheetQuery;
}