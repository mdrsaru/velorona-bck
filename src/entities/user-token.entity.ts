import { string } from 'joi';
import { Field, ID, InputType, ObjectType, registerEnumType } from 'type-graphql';
import { Column, Entity, ManyToOne, JoinColumn, Index } from 'typeorm';

import User from './user.entity';
import { Base } from './base.entity';
import { entities, TokenType } from '../config/constants';

registerEnumType(TokenType, {
  name: 'TokenType',
});

@Entity({ name: entities.userTokens })
@ObjectType()
export default class UserToken extends Base {
  @Field((type) => TokenType)
  @Index()
  @Column({
    type: 'enum',
    enum: TokenType,
    default: TokenType.refresh,
  })
  name: TokenType;

  @Field()
  @Column({ type: 'text' })
  token: string;

  @Field()
  @Column()
  expiresIn: Date;

  @Column()
  user_id: string;

  @ManyToOne(() => User, (user) => user.tokens)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
