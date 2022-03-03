import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ObjectType, Field, ID, InputType } from 'type-graphql';

import { entities } from '../config/constants';
import { PagingResult } from './common.entity';

@Entity({ name: entities.clients })
@ObjectType()
export default class Client extends BaseEntity {
  @Field((type) => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  name: string;

  @Field()
  @Column()
  status: string;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}

@ObjectType()
export class ClientPagingResult {
  @Field()
  paging: PagingResult;

  @Field(() => [Client])
  data: Client[];
}

@InputType()
export class ClientCreate {
  @Field()
  name: string;

  @Field()
  status: string;
}

@InputType()
export class ClientUpdate {
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
