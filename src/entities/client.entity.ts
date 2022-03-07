import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ObjectType, Field, ID, InputType } from 'type-graphql';

import { entities } from '../config/constants';
import { PagingResult } from './common.entity';
import { Base } from './base.entity';

declare function returnsString(): string;

@Entity({ name: entities.clients })
@ObjectType()
export default class Client extends Base {
  @Field()
  @Column()
  name: string;

  @Field()
  @Column()
  status: string;
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

  @Field()
  status: string;
}

@InputType()
export class ClientUpdateInput {
  @Field()
  id: string;

  @Field()
  name: string;

  @Field()
  status: string;
}

@InputType()
export class ClientQueryInput {
  @Field({ nullable: true })
  skip: number;

  @Field({ nullable: true })
  limit: number;

  @Field({ nullable: true })
  sort: string;
}
