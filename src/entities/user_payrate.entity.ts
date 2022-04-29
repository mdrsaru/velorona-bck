import { Field, InputType, ObjectType } from 'type-graphql';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { entities } from '../config/constants';
import { Base } from './base.entity';
import { PagingInput, PagingResult } from './common.entity';
import Project from './project.entity';
import User from './user.entity';

@ObjectType()
@Entity({ name: entities.userPayRate })
export default class UserPayRate extends Base {
  @Field()
  @Column({ name: 'start_date' })
  startDate: Date;

  @Field()
  @Column({ name: 'end_date' })
  endDate: Date;

  @Field()
  @Column()
  amount: number;

  @Field()
  @Column()
  user_id: string;

  @Field((type) => User)
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Field()
  @Column()
  project_id: string;

  @Field((type) => Project)
  @ManyToOne(() => Project)
  @JoinColumn({ name: 'project_id' })
  project: Project;
}

@InputType()
export class UserPayRateCreateInput {
  @Field()
  startDate: Date;

  @Field({ nullable: true })
  endDate: Date;

  @Field()
  amount: number;

  @Field()
  project_id: string;

  @Field()
  user_id: string;

  @Field()
  company_id: string;
}

@InputType()
export class UserPayRateUpdateInput {
  @Field()
  id: string;

  @Field({ nullable: true })
  startDate: Date;

  @Field({ nullable: true })
  endDate: Date;

  @Field({ nullable: true })
  amount: number;

  @Field({ nullable: true })
  project_id: string;

  @Field({ nullable: true })
  user_id: string;
}

@InputType()
export class UserPayRateQuery {
  @Field({ nullable: true })
  id: string;

  @Field({ nullable: true })
  project_id: string;
}

@InputType()
export class UserPayRateQueryInput {
  @Field({ nullable: true })
  paging: PagingInput;

  @Field()
  query: UserPayRateQuery;
}

@ObjectType()
export class UserPayRatePagingResult {
  @Field()
  paging: PagingResult;

  @Field(() => [UserPayRate])
  data: UserPayRate[];
}
