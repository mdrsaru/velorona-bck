import { Field, InputType, ObjectType, registerEnumType } from 'type-graphql';
import { Column, Entity, Index, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, OneToOne } from 'typeorm';

import { Base } from './base.entity';
import User from './user.entity';
import Company from './company.entity';
import Workschedule from './workschedule.entity';
import { entities, TaskStatus } from '../config/constants';
import { PagingInput, PagingResult } from './common.entity';
import { taskAssignmentTable, taskAttachmentTable } from '../config/db/columns';
import TimeEntry from './time-entry.entity';
import Project from './project.entity';
import Media from './media.entity';

const indexPrefix = 'task';

registerEnumType(TaskStatus, {
  name: 'TaskStatus',
});

@Entity({ name: entities.tasks })
@ObjectType()
export default class Task extends Base {
  @Field()
  @Column()
  name: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  description: string;

  @Index(`${indexPrefix}_status_index`)
  @Field({ nullable: true })
  @Column('varchar', { nullable: true, default: TaskStatus.UnScheduled })
  status: TaskStatus;

  @Index(`${indexPrefix}_active_index`)
  @Field()
  @Column({ name: 'active', default: true })
  active: boolean;

  @Field()
  @Column({ name: 'archived', default: false })
  archived: boolean;

  @Field()
  @Column({ name: 'priority ', default: false })
  priority: boolean;

  @Field({ nullable: true })
  @Column({ nullable: true })
  deadline: Date;

  @Index(`${indexPrefix}_created_by`)
  @Field({ nullable: true })
  @Column({ nullable: true })
  created_by: string;

  @Field(() => User, { nullable: true })
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @Field()
  @Column()
  manager_id: string;

  @Field(() => User)
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

  @Field(() => TimeEntry, { nullable: true, description: 'Field for timeEntry' })
  @OneToMany(() => TimeEntry, (timeEntry) => timeEntry.task)
  timeEntry: TimeEntry[];

  @Field()
  @Column()
  project_id: string;

  @Field(() => Project)
  @ManyToOne(() => Project)
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @Field(() => [Media])
  @ManyToMany(() => Media, (attachment) => attachment.tasks)
  @JoinTable({
    name: entities.taskAttachments,

    joinColumn: {
      name: taskAttachmentTable.task_id,
      referencedColumnName: 'id',
    },

    inverseJoinColumn: {
      name: taskAttachmentTable.media_id,
      referencedColumnName: 'id',
    },
  })
  attachments: Media[];
}

@InputType()
export class TaskCreateInput {
  @Field()
  name: string;

  @Field({ nullable: true })
  description: string;

  @Field((type) => TaskStatus)
  status: TaskStatus;

  @Field({ nullable: true })
  active: boolean;

  @Field({ nullable: true })
  archived: boolean;

  @Field({ nullable: true })
  deadline: Date;

  @Field()
  manager_id: string;

  @Field()
  company_id: string;

  @Field()
  project_id: string;

  @Field(() => [String], { nullable: true })
  user_ids: string[];

  @Field(() => [String], { nullable: true })
  attachment_ids: string[];
}

@InputType()
export class TaskUpdateInput {
  @Field()
  id: string;

  @Field()
  company_id: string;

  @Field({ nullable: true })
  name: string;

  @Field({ nullable: true })
  description: string;

  @Field((type) => TaskStatus, { nullable: true })
  status: TaskStatus;

  @Field({ nullable: true })
  active: boolean;

  @Field({ nullable: true })
  archived: boolean;

  @Field({ nullable: true })
  priority: boolean;

  @Field({ nullable: true })
  deadline: Date;

  @Field({ nullable: true })
  manager_id: string;

  @Field({ nullable: true })
  project_id: string;

  @Field(() => [String], { nullable: true })
  user_ids: string[];

  @Field(() => [String], { nullable: true })
  attachment_ids: string[];
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

  @Field({ nullable: true })
  status: string;

  @Field()
  company_id: string;

  @Field({ nullable: true, description: 'Assigned user_id for the task' })
  user_id: string;

  @Field({ nullable: true })
  project_id: string;

  @Field({ nullable: true, defaultValue: false })
  archived: boolean;
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
