import { ObjectType, Field, InputType, registerEnumType } from 'type-graphql';
import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { entities, UserProjectStatus } from '../config/constants';
import { usersProjects } from '../config/db/columns';
import { PagingInput, PagingResult } from './common.entity';
import Project from './project.entity';
import User from './user.entity';

registerEnumType(UserProjectStatus, {
  name: 'UserProjectStatus',
});

@ObjectType()
@Entity({ name: entities.userProject })
export default class UserProject {
  @Field()
  @Column({ default: UserProjectStatus.Inactive })
  status: UserProjectStatus;

  @Field()
  @PrimaryColumn()
  user_id: string;

  @Field(() => User)
  @ManyToOne(() => User)
  @JoinColumn({ name: usersProjects.user_id })
  user: User;

  @Field()
  @PrimaryColumn()
  project_id: string;

  @Field(() => Project)
  @ManyToOne(() => Project)
  @JoinColumn({ name: usersProjects.project_id })
  project: Project;

  @Field()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

@InputType()
export class UserProjectChangeStatusInput {
  @Field()
  user_id: string;

  @Field({ description: 'Company user and project belongs to.' })
  company_id: string;

  @Field()
  project_id: string;

  @Field((type) => UserProjectStatus, { nullable: true })
  status: UserProjectStatus;
}

@InputType()
export class UserProjectQuery {
  @Field({ nullable: true })
  project_id: string;

  @Field({ nullable: true })
  user_id: string;

  @Field({ nullable: true })
  company_id: string;

  @Field({ nullable: true })
  status: string;

  @Field({ nullable: true })
  client_id: string;
}

@InputType()
export class UserProjectQueryInput {
  @Field({ nullable: true })
  paging: PagingInput;

  @Field()
  query: UserProjectQuery;
}

@ObjectType()
export class UserProjectPagingResult {
  @Field()
  paging: PagingResult;

  @Field(() => [UserProject])
  data: UserProject[];
}

@ObjectType()
export class UserProjectDetail {
  @Field({ nullable: true })
  user_id: string;

  @Field({ nullable: true })
  clientName: string;

  @Field({ nullable: true })
  projectId: string;

  @Field({ nullable: true })
  projectName: string;

  @Field({ nullable: true })
  userClientStatus: string;

  @Field({ nullable: true })
  userProjectStatus: string;
}
