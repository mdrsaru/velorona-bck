import { Field, InputType, ObjectType } from 'type-graphql';
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { entities } from '../config/constants';
import { Base } from './base.entity';
import { PagingInput, PagingResult } from './common.entity';
import Company from './company.entity';
import User from './user.entity';

const indexPrefix = 'activity_log';

@Entity({ name: entities.activityLogs })
@ObjectType()
export default class ActivityLog extends Base {
  @Field({ nullable: true })
  @Column({ nullable: true })
  message: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  type: string;

  @Index(`${indexPrefix}_user_id_index`)
  @Field()
  @Column()
  user_id: string;

  @Field((type) => User)
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Index(`${indexPrefix}_company_id_index`)
  @Field()
  @Column()
  company_id: string;

  @Field((type) => Company)
  @ManyToOne(() => Company)
  @JoinColumn({ name: 'company_id' })
  company: Company;
}

@InputType()
export class ActivityLogQuery {
  @Field({ nullable: true })
  id: string;

  @Field()
  company_id: string;

  @Field({ nullable: true })
  user_id: string;
}

@InputType()
export class ActivityLogQueryInput {
  @Field({ nullable: true })
  paging: PagingInput;

  @Field({ nullable: true })
  query: ActivityLogQuery;
}

@ObjectType()
export class ActivityLogPagingResult {
  @Field()
  paging: PagingResult;

  @Field(() => [ActivityLog])
  data: ActivityLog[];
}
