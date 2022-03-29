import { string } from 'joi';
import { Field, InputType, ObjectType } from 'type-graphql';
import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { entities } from '../config/constants';
import { Base } from './base.entity';
import Task from './task.entity';
import User from './user.entity';

@Entity({ name: entities.task_assignment })
@ObjectType()
export default class TaskAssignment extends Base {
  @Field()
  @Column({ nullable: true })
  employee_id: string;

  @ManyToOne(() => User, (user) => user.record)
  @JoinColumn({ name: 'employee_id' })
  employee: User;

  @Field()
  @Column()
  task_id: string;

  @ManyToOne(() => Task, (task) => task.taskAssignment)
  @JoinColumn({ name: 'task_id' })
  task: Task;
}

@InputType()
export class AssignTaskCreateInput {
  @Field()
  employee_id: string;

  @Field()
  task_id: string;
}
