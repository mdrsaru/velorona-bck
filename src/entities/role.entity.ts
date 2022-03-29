import { string } from 'joi';
import { Field, ID, InputType, ObjectType, registerEnumType } from 'type-graphql';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { entities, Role as RoleEnum } from '../config/constants';
import { Base } from './base.entity';
import { PagingInput, PagingResult } from './common.entity';
import User from './user.entity';

registerEnumType(RoleEnum, {
  name: 'RoleName',
});

@Entity({ name: entities.roles })
@ObjectType()
export default class Role extends Base {
  @Field((type) => RoleEnum)
  @Index()
  @Column({
    type: 'enum',
    enum: RoleEnum,
    default: RoleEnum.CompanyAdmin,
  })
  name: RoleEnum;

  @Field()
  @Column({ nullable: true })
  description: string;

  @ManyToMany(() => Role)
  users: User[];
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
  @Field((type) => RoleEnum)
  name: RoleEnum;

  @Field({ nullable: true })
  description: string;
}

@InputType()
export class RoleUpdateInput {
  @Field()
  id: string;

  @Field((type) => RoleEnum)
  name: RoleEnum;

  @Field({ nullable: true })
  description: string;
}

@InputType()
export class RoleQuery {
  @Field({ nullable: true })
  id: string;

  @Field((type) => RoleEnum, { nullable: true })
  name: RoleEnum;
}

@InputType()
export class RoleQueryInput {
  @Field({ nullable: true })
  paging: PagingInput;

  @Field({ nullable: true })
  query: RoleQuery;
}
