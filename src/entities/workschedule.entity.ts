import { Field, InputType, ObjectType } from 'type-graphql';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { entities } from '../config/constants';
import { Base } from './base.entity';
import { PagingInput, PagingResult } from './common.entity';
import Company from './company.entity';
import Task from './task.entity';
import User from './user.entity';

@ObjectType()
@Entity({ name: entities.workschedule })
export default class Workschedule extends Base {
  @Field()
  @Column()
  date: Date;

  @Field()
  @Column()
  from: number;

  @Field()
  @Column()
  to: number;

  @Field()
  @Column()
  task_id: string;

  @Field(() => Task)
  @ManyToOne(() => Task)
  @JoinColumn({ name: 'task_id' })
  tasks: Task;

  @Field()
  @Column()
  user_id: string;

  @Field(() => User)
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Field()
  @Column()
  company_id: string;

  @Field(() => Company)
  @ManyToOne(() => Company)
  @JoinColumn({ name: 'company_id' })
  company: Company;
}

@ObjectType()
export class WorkschedulePagingResult {
  @Field()
  paging: PagingResult;

  @Field(() => [Workschedule])
  data: Workschedule[];
}

@InputType()
export class WorkscheduleCreateInput {
  @Field()
  date: Date;

  @Field()
  from: number;

  @Field()
  to: number;

  @Field()
  task_id: string;

  @Field()
  user_id: string;

  @Field()
  company_id: string;
}

@InputType()
export class WorkscheduleUpdateInput {
  @Field()
  id: string;

  @Field({ nullable: true })
  date: Date;

  @Field({ nullable: true })
  from: number;

  @Field({ nullable: true })
  to: number;

  @Field({ nullable: true })
  task_id: string;

  @Field({ nullable: true })
  user_id: string;

  @Field({ nullable: true })
  company_id: string;
}

@InputType()
export class WorkscheduleQuery {
  @Field({ nullable: true })
  id: string;

  @Field({ nullable: true })
  company_id: string;
}

@InputType()
export class WorkscheduleQueryInput {
  @Field({ nullable: true })
  paging: PagingInput;

  @Field({ nullable: true })
  query: WorkscheduleQuery;
}
