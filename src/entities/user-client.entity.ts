import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ObjectType, Field, registerEnumType, InputType } from 'type-graphql';

import { UserClientStatus, entities } from '../config/constants';
import User from './user.entity';
import { Base } from './base.entity';

registerEnumType(UserClientStatus, {
  name: 'UserClientStatus',
});

@ObjectType()
@Entity({ name: entities.userClient })
export default class UserClient extends Base {
  @Field()
  @Column()
  status: UserClientStatus;

  @Field()
  @Column()
  user_id: string;

  @Field(() => User)
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Field()
  @Column()
  client_id: string;

  @Field(() => User)
  @ManyToOne(() => User)
  @JoinColumn({ name: 'client_id' })
  client: User;
}

@InputType()
export class AssociateUserClientInput {
  @Field()
  user_id: string;

  @Field()
  client_id: string;
}
