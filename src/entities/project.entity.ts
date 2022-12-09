import { Entity, Column, ManyToOne, JoinColumn, ManyToMany, JoinTable, OneToOne, RelationId, OneToMany } from 'typeorm';
import { ObjectType, Field, ID, InputType, registerEnumType } from 'type-graphql';

import { entities, ProjectStatus } from '../config/constants';
import User from './user.entity';
import Company from './company.entity';
import { Base } from './base.entity';
import { PagingInput, PagingResult } from './common.entity';
import TimeEntry from './time-entry.entity';
import Client from './client.entity';
import UserPayRate from './user-payrate.entity';
import { userProjectTable } from '../config/db/columns';

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

  @Field(() => Client, { nullable: true })
  @ManyToOne(() => Client, { nullable: true })
  @JoinColumn({ name: 'client_id' })
  client: Client;

  @Field({ nullable: true })
  @Column({ nullable: true })
  client_id: string;

  @Field(() => TimeEntry, { nullable: true, description: 'Field for timeEntry' })
  @OneToMany(() => TimeEntry, (timeEntry) => timeEntry.project)
  timeEntry: TimeEntry[];

  @Field(() => UserPayRate, { nullable: true, description: 'Field for UserPayRate' })
  @OneToMany(() => UserPayRate, (userpayrate) => userpayrate.project)
  userPayRate: UserPayRate[];

  @Field(() => [User], { nullable: true })
  @ManyToMany(() => User)
  @JoinTable({
    name: entities.userProject,
    joinColumn: {
      name: userProjectTable.project_id,
      referencedColumnName: 'id',
    },

    inverseJoinColumn: {
      name: userProjectTable.user_id,
      referencedColumnName: 'id',
    },
  })
  users: User[];
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

  @Field({ nullable: true })
  client_id: string;

  @Field((type) => ProjectStatus, { nullable: true })
  status: ProjectStatus;

  @Field({ nullable: true })
  archived: boolean;

  @Field(() => [String], { nullable: true })
  user_ids: string[];
}

@InputType()
export class ProjectUpdateInput {
  @Field()
  id: string;

  @Field()
  company_id: string;

  @Field({ nullable: true })
  name: string;

  @Field((type) => ProjectStatus, { nullable: true })
  status: ProjectStatus;

  @Field({ nullable: true })
  client_id: string;

  @Field({ nullable: true })
  archived: boolean;

  @Field(() => [String], { nullable: true })
  user_ids: string[];
}

@InputType()
export class ProjectQuery {
  @Field({ nullable: true })
  id: string;

  @Field({ description: 'Query by company id' })
  company_id: string;

  @Field({ nullable: true })
  client_id: string;

  @Field({ nullable: true })
  search: string;

  @Field({ nullable: true, defaultValue: false })
  archived: boolean;

  @Field({ nullable: true })
  status: string;

  @Field({ nullable: true, description: 'Assigned user_id for the project' })
  user_id: string;
}

@InputType()
export class ProjectQueryInput {
  @Field({ nullable: true })
  paging: PagingInput;

  @Field()
  query: ProjectQuery;
}

@InputType()
export class ProjectCountInput {
  @Field()
  company_id: string;

  @Field({ nullable: true })
  user_id: string;
}

@InputType()
export class ActiveProjectCountInput {
  @Field()
  company_id: string;

  @Field({ nullable: true, defaultValue: false })
  archived: boolean;

  @Field({ nullable: true, defaultValue: ProjectStatus.Active })
  status: string;

  @Field({ nullable: true })
  user_id: string;

  @Field({ nullable: true })
  manager_id: string;
}

@ObjectType({ description: 'Projects with total duration and expense for the provided interval of the time entries' })
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

@InputType({ description: 'Input for fetching project items with total expense and duration' })
export class ProjectItemInput {
  @Field()
  startTime: string;

  @Field()
  endTime: string;

  @Field()
  company_id: string;

  @Field()
  user_id: string;

  @Field()
  client_id: string;
}

@InputType()
export class RemoveProjectUserAssignInput {
  @Field()
  user_id: string;

  @Field()
  project_id: string;

  @Field()
  company_id: string;
}
