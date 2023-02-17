import { ObjectType, Field, InputType, registerEnumType } from 'type-graphql';
import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { entities, UserProjectStatus } from '../config/constants';
import { usersProjects } from '../config/db/columns';
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
