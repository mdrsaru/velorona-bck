import { string } from 'joi';
import { Field, ID, InputType, ObjectType } from 'type-graphql';
import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { entities } from '../config/constants';
import { Base } from './base.entity';
import { PagingInput, PagingResult } from './common.entity';

@Entity({ name: entities.roles })
@ObjectType()
export default class Role extends Base {
  @Field()
  @Column()
  name: string;

  @Field()
  @Column()
  description: string;
}

@ObjectType()
export class RolePagingResult {
  @Field()
  paging: PagingResult;

  @Field(() => [Role])
  data: Role[];
}

@InputType()
export class RoleCreateInput {
  @Field()
  name: string;

  @Field()
  description: string;
}

@InputType()
export class RoleUpdateInput {
  @Field()
  id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  description: string;
}

@InputType()
export class RoleQuery {
  @Field({ nullable: true })
  id: string;
}

@InputType()
export class RoleQueryInput {
  @Field({ nullable: true })
  paging: PagingInput;

  @Field({ nullable: true })
  query: RoleQuery;
}
