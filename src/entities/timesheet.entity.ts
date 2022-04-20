import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ObjectType, Field, ID, InputType } from 'type-graphql';
import { entities } from '../config/constants';
import { timesheet } from '../config/db/columns';
import Company from './company.entity';
import User from './user.entity';
import Project from './project.entity';
import { Base } from './base.entity';
import { PagingInput, PagingResult } from './common.entity';

@ObjectType()
@Entity({ name: entities.timesheet })
export default class Timesheet extends Base {
  @Field({ nullable: true })
  @Column({ nullable: true })
  total_hours: number;

  @Field({ nullable: true })
  @Column({ type: 'float', nullable: true })
  total_expense: number;

  @Field()
  @Column()
  client_location: string;

  @Field()
  @Column()
  project_id: string;

  @Field((type) => Project)
  @ManyToOne(() => Project)
  @JoinColumn({ name: timesheet.project_id })
  project: Project;

  @Field()
  @Column()
  approver_id: string;

  @Field((type) => User)
  @ManyToOne(() => User)
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
  @Field({ nullable: true })
  total_hours: number;

  @Field({ nullable: true })
  total_expense: number;

  @Field({ nullable: true })
  client_location: string;

  @Field()
  project_id: string;

  @Field()
  company_id: string;

  @Field()
  approver_id: string;

  @Field()
  created_by: string;
}

@InputType()
export class TimesheetUpdateInput {
  @Field()
  id: string;

  @Field({ nullable: true })
  total_hours: number;

  @Field({ nullable: true })
  total_expense: number;

  @Field({ nullable: true })
  client_location: string;

  @Field({ nullable: true })
  project_id: string;

  @Field({ nullable: true })
  company_id: string;

  @Field({ nullable: true })
  approver_id: string;

  @Field({ nullable: true })
  created_by: string;
}

@InputType()
export class TimesheetQuery {
  @Field({ nullable: true })
  id: string;
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
