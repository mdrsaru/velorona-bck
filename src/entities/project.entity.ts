import { Entity, Column, ManyToOne, JoinColumn, ManyToMany, JoinTable, OneToOne, RelationId, OneToMany } from 'typeorm';
import { ObjectType, Field, ID, InputType, registerEnumType } from 'type-graphql';

import { entities } from '../config/constants';
import User from './user.entity';
import Company from './company.entity';
import { Base } from './base.entity';
import { PagingInput, PagingResult } from './common.entity';
import Timesheet from './timesheet.entity';
import Task from './task.entity';
import Client from './client.entity';
import UserPayRate from './user_payrate.entity';

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

  @Field(() => Client)
  @ManyToOne(() => Client)
  @JoinColumn({ name: 'client_id' })
  client: Client;

  @Field()
  @Column()
  client_id: string;

  @Field(() => Timesheet, { nullable: true, description: 'Field for timesheet' })
  @OneToMany(() => Timesheet, (timesheet) => timesheet.project)
  timesheet: Timesheet[];

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
}

@InputType()
export class ProjectUpdateInput {
  @Field()
  id: string;

  @Field()
  company_id: string;

  @Field()
  name: string;
}

@InputType()
export class ProjectQuery {
  @Field({ nullable: true })
  id: string;

  @Field({ description: 'Query by company id' })
  company_id: string;

  @Field({ nullable: true })
  client_id: string;
}

@InputType()
export class ProjectQueryInput {
  @Field({ nullable: true })
  paging: PagingInput;

  @Field()
  query: ProjectQuery;
}
