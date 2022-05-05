import { string } from 'joi';
import { Field, ID, InputType, ObjectType } from 'type-graphql';
import { Column, Entity, JoinColumn, Index, OneToOne } from 'typeorm';

import User from './user.entity';
import { Base } from './base.entity';
import { entities } from '../config/constants';

@Entity({ name: entities.userRecord })
@ObjectType()
export default class UserRecord extends Base {
  @Field({ nullable: true })
  @Column({ name: 'start_date' })
  startDate: Date;

  @Field({ nullable: true })
  @Column({ name: 'end_date' })
  endDate: Date;

  @Field({ nullable: true })
  @Column({ name: 'pay_rate' })
  payRate: number;

  // @Field()
  // @Column()
  // user_id: string;

  // @OneToOne(() => User, (user) => user.record)
  // @JoinColumn({ name: 'user_id' })
  // user: User;
}

@InputType()
export class UserRecordCreateInput {
  @Field()
  startDate: Date;

  @Field()
  endDate: Date;

  @Field()
  payRate: number;
}

@InputType()
export class UserRecordUpdateInput {
  @Field({ nullable: true })
  startDate: Date;

  @Field({ nullable: true })
  endDate: Date;

  @Field({ nullable: true })
  payRate: number;
}
