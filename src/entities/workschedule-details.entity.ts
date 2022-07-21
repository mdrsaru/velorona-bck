import { Field, InputType, ObjectType } from 'type-graphql';
import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { entities } from '../config/constants';
import { Base } from './base.entity';
import { PagingInput, PagingResult } from './common.entity';
import { workscheduleDetail } from '../config/db/columns';
import User from './user.entity';
import Workschedule from './workschedule.entity';
import WorkscheduleTimeDetail from './workschedule-time-details.entity';

const indexPrefix = 'workschedule';
@ObjectType()
@Entity({ name: entities.workscheduleDetail })
export default class WorkscheduleDetail extends Base {
  @Index(`${indexPrefix}_date`)
  @Field()
  @Column()
  schedule_date: Date;

  @Field()
  @Column()
  duration: Number;

  @Field()
  @Column()
  workschedule_id: string;

  @Field(() => Workschedule)
  @ManyToOne(() => Workschedule, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: workscheduleDetail.workschedule_id })
  workschedule: Workschedule;

  @Field()
  @Column()
  user_id: string;

  @Field(() => User)
  @ManyToOne(() => User)
  @JoinColumn({ name: workscheduleDetail.user_id })
  user: User;

  @Field(() => WorkscheduleTimeDetail, { nullable: true, description: 'Field for WorkscheduleTimeDetail' })
  @OneToMany(() => WorkscheduleTimeDetail, (workscheduleTimeDetail) => workscheduleTimeDetail.workscheduleDetail, {
    cascade: ['remove', 'update'],
  })
  WorkscheduleTimeDetail: WorkscheduleTimeDetail[];

  @Field((type) => [WorkscheduleTimeDetail], { nullable: true })
  workscheduleTimeDetail: string[];
}

@ObjectType()
export class WorkscheduleDetailPagingResult {
  @Field()
  paging: PagingResult;

  @Field(() => [WorkscheduleDetail])
  data: WorkscheduleDetail[];
}

@InputType()
export class WorkscheduleDetailCreateInput {
  @Field()
  schedule_date: Date;

  @Field()
  startTime: Date;

  @Field()
  endTime: Date;

  @Field({ nullable: true })
  workschedule_id: string;

  @Field()
  user_id: string;
}

@InputType()
export class WorkscheduleDetailUpdateInput {
  @Field()
  id: string;

  @Field({ nullable: true })
  schedule_date: Date;

  @Field({ nullable: true })
  startTime: Date;

  @Field({ nullable: true })
  endTime: Date;

  @Field({ nullable: true })
  workschedule_id: string;

  @Field({ nullable: true })
  user_id: string;
}

@InputType()
export class WorkscheduleDetailQuery {
  @Field({ nullable: true })
  id: string;

  @Field({ nullable: true })
  workschedule_id: string;

  @Field({ nullable: true })
  schedule_date: Date;

  @Field({ nullable: true })
  user_id: string;
}

@InputType()
export class WorkscheduleDetailQueryInput {
  @Field({ nullable: true })
  paging: PagingInput;

  @Field({ nullable: true })
  query: WorkscheduleDetailQuery;
}

@InputType()
export class WorkscheduleDetailBulkDeleteInput {
  @Field((type) => [String])
  ids: string[];

  @Field()
  user_id: string;

  @Field()
  workschedule_id: string;
}
