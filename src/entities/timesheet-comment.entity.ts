import { Field, InputType, ObjectType, registerEnumType } from 'type-graphql';
import { Column, Entity, Index, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, OneToOne } from 'typeorm';

import { entities } from '../config/constants';
import { Base } from './base.entity';
import User from './user.entity';
import Timesheet from './timesheet.entity';
import Company from './company.entity';
import { PagingResult, PagingInput, DeleteInput } from './common.entity';

const indexPrefix = entities.timesheetComments;

@Entity({ name: entities.timesheetComments })
@ObjectType()
export default class TimesheetComment extends Base {
  @Field()
  @Column()
  comment: string;

  @Index(`${indexPrefix}_user_id`)
  @Field()
  @Column()
  user_id: string;

  @Field(() => User)
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Index(`${indexPrefix}_timesheet_id`)
  @Field()
  @Column()
  timesheet_id: string;

  @Field(() => Timesheet)
  @ManyToOne(() => Timesheet)
  @JoinColumn({ name: 'timesheet_id' })
  timesheet: Timesheet;

  @Index(`${indexPrefix}_reply_id`)
  @Field({ nullable: true })
  @Column({ nullable: true })
  reply_id: string;

  @Field(() => TimesheetComment, { nullable: true })
  @ManyToOne(() => TimesheetComment, { nullable: true })
  @JoinColumn({ name: 'reply_id' })
  reply: TimesheetComment;

  @Field()
  replyCount: number;
}

@InputType()
export class TimesheetCommentCreateInput {
  @Field()
  company_id: string;

  @Field()
  timesheet_id: string;

  @Field()
  comment: string;

  @Field({ nullable: true })
  user_id: string;

  @Field({ nullable: true })
  reply_id: string;
}

@InputType()
export class TimesheetCommentUpdateInput {
  @Field()
  id: string;

  @Field()
  company_id: string;

  @Field()
  comment: string;
}

@InputType()
export class TimesheetCommentDeleteInput extends DeleteInput {
  @Field()
  company_id: string;
}

@ObjectType()
export class TimesheetCommentPagingResult {
  @Field()
  paging: PagingResult;

  @Field(() => [TimesheetComment])
  data: TimesheetComment[];
}

@InputType()
export class TimesheetCommentQuery {
  @Field({ nullable: true })
  id: string;

  @Field()
  company_id: string;

  @Field()
  timesheet_id: string;

  @Field({ nullable: true })
  user_id: string;

  @Field({ nullable: true })
  reply_id: string;

  @Field({ nullable: true })
  parent: boolean;
}

@InputType()
export class TimesheetCommentQueryInput {
  @Field({ nullable: true })
  paging: PagingInput;

  @Field()
  query: TimesheetCommentQuery;
}
