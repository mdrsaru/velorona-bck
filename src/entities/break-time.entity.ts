import { Field, ObjectType } from 'type-graphql';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { entities } from '../config/constants';
import { breakTimeTable, userPayRate } from '../config/db/columns';
import { Base } from './base.entity';
import TimeEntry from './time-entry.entity';

@ObjectType()
@Entity({ name: entities.breakTimes })
export default class BreakTime extends Base {
  @Field({ nullable: true })
  @Column({ name: breakTimeTable.start_time, nullable: true })
  startTime: Date;

  @Field({ nullable: true })
  @Column({ name: breakTimeTable.end_time, nullable: true })
  endTime: Date;

  @Field({ nullable: true })
  @Column({ nullable: true, type: 'int' })
  duration: number;

  @Field({ nullable: true })
  @Column({ nullable: true })
  time_entry_id: string;

  @Field((type) => TimeEntry, { nullable: true })
  @ManyToOne(() => TimeEntry)
  @JoinColumn({ name: breakTimeTable.time_entry_id })
  timeEntry: TimeEntry;
}
