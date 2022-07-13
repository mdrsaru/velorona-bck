import { Field, GraphQLISODateTime, InputType, ObjectType } from 'type-graphql';
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { entities } from '../config/constants';
import { workscheduleTimeDetail } from '../config/db/columns';
import { Base } from './base.entity';
import { PagingInput, PagingResult } from './common.entity';
import WorkscheduleDetail from './workschedule-details.entity';

const indexPrefix = 'workscheduleTimeDetail';
@ObjectType()
@Entity({ name: entities.workscheduleTimeDetail })
export default class WorkscheduleTimeDetail extends Base {
  @Index(`${indexPrefix}_start_time`)
  @Field(() => GraphQLISODateTime)
  @Column({ name: workscheduleTimeDetail.start_time })
  startTime: Date;

  @Index(`${indexPrefix}_end_date`)
  @Field()
  @Column({ name: workscheduleTimeDetail.end_time })
  endTime: Date;

  @Field()
  @Column()
  duration: Number;

  @Index(`${indexPrefix}_workschedule_detail`)
  @Field()
  @Column()
  workschedule_detail_id: string;

  @Field(() => WorkscheduleDetail)
  @ManyToOne(() => WorkscheduleDetail)
  @JoinColumn({ name: workscheduleTimeDetail.workschedule_detail_id })
  workscheduleDetail: WorkscheduleDetail;
}

@ObjectType()
export class WorkscheduleTimeDetailPagingResult {
  @Field()
  paging: PagingResult;

  @Field(() => [WorkscheduleTimeDetail])
  data: WorkscheduleTimeDetail[];
}

@InputType()
export class WorkscheduleTimeDetailCreateInput {
  @Field()
  startTime: Date;

  @Field()
  endTime: Date;

  @Field()
  workschedule_detail_id: string;
}
@InputType()
export class WorkscheduleTimeDetailUpdateInput {
  @Field()
  id: string;

  @Field({ nullable: true })
  startTime: Date;

  @Field({ nullable: true })
  endTime: Date;

  @Field()
  workschedule_detail_id: string;
}

@InputType()
export class WorkscheduleTimeDetailQuery {
  @Field({ nullable: true })
  id: string;

  @Field({ nullable: true })
  workschedule_detail_id: string;
}

@InputType()
export class WorkscheduleTimeDetailQueryInput {
  @Field({ nullable: true })
  paging: PagingInput;

  @Field({ nullable: true })
  query: WorkscheduleTimeDetailQuery;
}
