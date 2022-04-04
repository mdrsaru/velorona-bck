import { Field, InputType, ObjectType, registerEnumType } from 'type-graphql';
import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany } from 'typeorm';
import { entities, TaskStatus } from '../config/constants';
import { Base } from './base.entity';
import Company from './company.entity';
import { PagingInput, PagingResult } from './common.entity';
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
  isArchived: boolean;

  @Field()
  @Column()
  manager_id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'manager_id' })
  manager: User;

  @Field()
  @Column()
  company_id: string;

  @ManyToOne(() => Company)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @Field(() => [User])
  @ManyToMany(() => User)
  @JoinTable({
    name: 'task_assignment',
    joinColumn: {
      name: 'task_id',
      referencedColumnName: 'id',
    },

    inverseJoinColumn: {
      name: 'employee_id',
      referencedColumnName: 'id',
    },
  })
  users: User[];
}

@InputType()
export class TaskCreateInput {
  @Field()
  name: string;

  @Field((type) => TaskStatus)
  status: TaskStatus;

  @Field()
  isArchived: boolean;

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
  isArchived: boolean;

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

@InputType()
export class AssignTaskCreateInput {
  @Field(() => [String])
  employee_id: string[];

  @Field()
  task_id: string;
}

@InputType()
export class AssignedUserQueryInput {
  @Field()
  id: string;

  @Field()
  company_id: string;
}
