import { Field, ObjectType } from 'type-graphql';
import { Column, Entity, OneToOne } from 'typeorm';
import { entities } from '../config/constants';
import { Base } from './base.entity';
import User from './user.entity';

@Entity({ name: entities.media })
@ObjectType()
export default class Media extends Base {
  @Field()
  @Column()
  id: string;

  @Field()
  @Column()
  name: string;

  @Field()
  @Column()
  url: string;
}
