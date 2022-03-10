import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ObjectType, Field, ID, InputType, registerEnumType } from 'type-graphql';

import { Base } from './base.entity';
import User from './user.entity';
import { entities, ClientStatus } from '../config/constants';
import { PagingResult, PagingInput } from './common.entity';

registerEnumType(ClientStatus, {
  name: 'ClientStatus',
});

@Entity({ name: entities.clients })
@ObjectType()
export default class Client extends Base {
  @Field()
  @Column()
  name: string;

  @Field((type) => ClientStatus)
  @Column({
    type: 'enum',
    enum: ClientStatus,
    default: ClientStatus.Inactive,
  })
  status: ClientStatus;

  @Field(() => [User])
  @OneToMany(() => User, (user) => user.client)
  users: User[];
}

@ObjectType()
export class ClientPagingResult {
  @Field()
  paging: PagingResult;

  @Field(() => [Client])
  data: Client[];
}

@InputType()
export class ClientCreateInput {
  @Field()
  name: string;

  @Field((type) => ClientStatus)
  status: ClientStatus;
}

@InputType()
export class ClientUpdateInput {
  @Field()
  id: string;

  @Field({ nullable: true })
  name: string;

  @Field((type) => ClientStatus, { nullable: true })
  status: ClientStatus;
}

@InputType()
export class ClientQuery {
  @Field({ nullable: true })
  id: string;
}

@InputType()
export class ClientQueryInput {
  @Field({ nullable: true })
  paging: PagingInput;

  @Field({ nullable: true })
  query: ClientQuery;
}
