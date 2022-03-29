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
  @Column()
  startDate: Date;

  @Field({ nullable: true })
  @Column()
  endDate: Date;

  @Field({ nullable: true })
  @Column()
  payRate: number;

  @Field()
  @Column()
  user_id: string;

  @OneToOne(() => User, (user) => user.record)
  @JoinColumn({ name: 'user_id' })
  user: User;
}

@InputType()
export class UserRecordCreateInput {
  @Field()
  @Column()
  startDate: Date;

  @Field()
  @Column()
  endDate: Date;

  @Field()
  @Column()
  payRate: number;
}

@InputType()
export class UserRecordUpdateInput {
  @Field({ nullable: true })
  @Column({ nullable: true })
  startDate: Date;

  @Field({ nullable: true })
  @Column({ nullable: true })
  endDate: Date;

  @Field({ nullable: true })
  @Column({ nullable: true })
  payRate: number;
}
