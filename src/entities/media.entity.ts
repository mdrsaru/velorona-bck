import { Field, ObjectType } from 'type-graphql';
import { Column, Entity, OneToOne, ManyToMany } from 'typeorm';

import { entities } from '../config/constants';
import { Base } from './base.entity';
import User from './user.entity';
import Task from './task.entity';

@Entity({ name: entities.media })
@ObjectType()
export default class Media extends Base {
  @Field()
  @Column()
  name: string;

  @Field()
  @Column()
  url: string;

  @ManyToMany(() => Task, (task) => task.attachments)
  tasks: Task[];
}
