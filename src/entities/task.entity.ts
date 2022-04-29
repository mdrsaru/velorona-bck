import { Field, InputType, ObjectType, registerEnumType } from 'type-graphql';
import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany } from 'typeorm';

import { Base } from './base.entity';
import User from './user.entity';
import Company from './company.entity';
import Workschedule from './workschedule.entity';
import { entities, TaskStatus } from '../config/constants';
import { PagingInput, PagingResult } from './common.entity';
import { taskAssignmentTable } from '../config/db/columns';
import Timesheet from './timesheet.entity';
import Project from './project.entity';

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
  @Column({ name: 'archived', default: false })
  archived: boolean;

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
    name: entities.taskAssignment,
    joinColumn: {
      name: taskAssignmentTable.task_id,
      referencedColumnName: 'id',
    },

    inverseJoinColumn: {
      name: taskAssignmentTable.user_id,
      referencedColumnName: 'id',
    },
  })
  users: User[];

  @Field(() => Workschedule, { nullable: true })
  @OneToMany(() => Workschedule, (workschedule) => workschedule.tasks)
  workschedules: Workschedule[];

  @Field(() => Timesheet, { nullable: true, description: 'Field for timesheet' })
  @OneToMany(() => Timesheet, (timesheet) => timesheet.task)
  timesheet: Timesheet[];

  @Field()
  @Column()
  project_id: string;

  @ManyToOne(() => Project)
  @JoinColumn({ name: 'project_id' })
  project: Project;
}

@InputType()
export class TaskCreateInput {
  @Field()
  name: string;

  @Field((type) => TaskStatus)
  status: TaskStatus;

  @Field({ nullable: true })
  archived: boolean;

  @Field()
  manager_id: string;

  @Field()
  company_id: string;

  @Field()
  project_id: string;

  @Field(() => [String], { nullable: true })
  user_id: string[];
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
  archived: boolean;

  @Field({ nullable: true })
  manager_id: string;

  @Field({ nullable: true })
  company_id: string;

  @Field({ nullable: true })
  project_id: string;

  @Field(() => [String], { nullable: true })
  user_id: string[];
}

@ObjectType()
export class TaskPagingResult {
  @Field()
  paging: PagingResult;

  @Field(() => [Task])
  data: Task[];
}

@InputType()
export class TaskQuery {
  @Field({ nullable: true })
  id: string;

  @Field((type) => TaskStatus, { nullable: true })
  status: TaskStatus;

  @Field()
  company_id: string;

  @Field({ nullable: true, description: 'Assigned user_id for the task' })
  user_id: string;
}

@InputType()
export class TaskQueryInput {
  @Field({ nullable: true })
  paging: PagingInput;

  @Field()
  query: TaskQuery;
}

@InputType()
export class AssignTaskInput {
  @Field(() => [String])
  user_id: string[];

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
