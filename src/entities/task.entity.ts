import { Field, InputType, ObjectType, registerEnumType } from 'type-graphql';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { entities, TaskStatus } from '../config/constants';
import { Base } from './base.entity';
import Company from './company.entity';
import { PagingInput, PagingResult } from './common.entity';
import TaskAssignment from './task-assignment.entity';
import User from './user.entity';

registerEnumType(TaskStatus, {
  name: 'TaskStatus',
});

@Entity({ name: entities.tasks })
@ObjectType()
export default class Task extends Base {
  @Field()
  @Column()
  name: string;

  @Field((type) => TaskStatus)
  @Column({
    type: 'enum',
    enum: TaskStatus,
    default: TaskStatus.Inactive,
  })
  status: TaskStatus;

  @Field()
  @Column()
  is_archived: boolean;

  @Field()
  @Column()
  manager_id: string;

  @ManyToOne(() => User, (user) => user.tasks)
  @JoinColumn({ name: 'manager_id' })
  manager: User;

  @Field()
  @Column()
  company_id: string;

  @ManyToOne(() => Company)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @Field(() => TaskAssignment)
  @OneToMany(() => TaskAssignment, (taskAssignment) => taskAssignment.task)
  taskAssignment: TaskAssignment[];
}

@InputType()
export class TaskCreateInput {
  @Field()
  name: string;

  @Field((type) => TaskStatus)
  status: TaskStatus;

  @Field()
  is_archived: boolean;

  @Field()
  manager_id: string;

  @Field()
  company_id: string;
}

@InputType()
export class TaskUpdateInput {
  @Field()
  id: string;

  @Field({ nullable: true })
  name: string;

  @Field((type) => TaskStatus, { nullable: true })
  status: TaskStatus;

  @Field({ nullable: true })
  is_archived: boolean;

  @Field({ nullable: true })
  manager_id: string;

  @Field({ nullable: true })
  company_id: string;
}

@ObjectType()
export class TaskPagingResult {
  @Field()
  paging: PagingResult;

  @Field(() => [Company])
  data: Company[];
}

@InputType()
export class TaskQuery {
  @Field({ nullable: true })
  id: string;

  @Field((type) => TaskStatus, { nullable: true })
  status: TaskStatus;

  @Field()
  company_id: string;
}
@InputType()
export class TaskQueryInput {
  @Field({ nullable: true })
  paging: PagingInput;

  @Field({ nullable: true })
  query: TaskQuery;
}
