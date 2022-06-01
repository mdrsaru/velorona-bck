import { Entity, Column, ManyToOne, JoinColumn, ManyToMany, JoinTable, OneToOne, RelationId, OneToMany } from 'typeorm';
import { ObjectType, Field, ID, InputType, registerEnumType } from 'type-graphql';

import { entities, ProjectStatus } from '../config/constants';
import User from './user.entity';
import Company from './company.entity';
import { Base } from './base.entity';
import { PagingInput, PagingResult } from './common.entity';
import TimeEntry from './time-entry.entity';
import Task from './task.entity';
import Client from './client.entity';
import UserPayRate from './user-payrate.entity';

registerEnumType(ProjectStatus, {
  name: 'ProjectStatus',
});
@ObjectType()
@Entity({ name: entities.projects })
export default class Project extends Base {
  @Field()
  @Column({ length: 50 })
  name: string;

  @Field(() => Company)
  @ManyToOne(() => Company)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @Field()
  @Column()
  company_id: string;

  @Field()
  @Column('varchar', {
    nullable: true,
    default: ProjectStatus.Active,
  })
  status: ProjectStatus;

  @Field()
  @Column({ default: false })
  archived: boolean;

  @Field(() => Client)
  @ManyToOne(() => Client)
  @JoinColumn({ name: 'client_id' })
  client: Client;

  @Field()
  @Column()
  client_id: string;

  @Field(() => TimeEntry, { nullable: true, description: 'Field for timeEntry' })
  @OneToMany(() => TimeEntry, (timeEntry) => timeEntry.project)
  timeEntry: TimeEntry[];

  @Field(() => Task, { nullable: true, description: 'Field for Task' })
  @OneToMany(() => Task, (task) => task.project)
  task: Task[];

  @Field(() => UserPayRate, { nullable: true, description: 'Field for UserPayRate' })
  @OneToMany(() => UserPayRate, (userpayrate) => userpayrate.project)
  userPayRate: UserPayRate[];
}

@ObjectType()
export class ProjectPagingResult {
  @Field()
  paging: PagingResult;

  @Field(() => [Project])
  data: Project[];
}

@InputType()
export class ProjectCreateInput {
  @Field()
  name: string;

  @Field()
  company_id: string;

  @Field()
  client_id: string;

  @Field((type) => ProjectStatus, { nullable: true })
  status: ProjectStatus;

  @Field({ nullable: true })
  archived: boolean;
}

@InputType()
export class ProjectUpdateInput {
  @Field()
  id: string;

  @Field()
  company_id: string;

  @Field()
  name: string;

  @Field((type) => ProjectStatus, { nullable: true })
  status: ProjectStatus;

  @Field({ nullable: true })
  archived: boolean;
}

@InputType()
export class ProjectQuery {
  @Field({ nullable: true })
  id: string;

  @Field({ description: 'Query by company id' })
  company_id: string;

  @Field({ nullable: true })
  client_id: string;

  @Field({ nullable: true, defaultValue: false })
  archived: boolean;
}

@InputType()
export class ProjectQueryInput {
  @Field({ nullable: true })
  paging: PagingInput;

  @Field()
  query: ProjectQuery;
}
