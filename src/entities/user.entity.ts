import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  ManyToMany,
  JoinTable,
  OneToOne,
  RelationId,
  OneToMany,
  Unique,
} from 'typeorm';
import { ObjectType, Field, ID, InputType, registerEnumType } from 'type-graphql';

import Company from './company.entity';
import Role from './role.entity';
import UserToken from './user-token.entity';
import Media from './media.entity';
import Client from './client.entity';
import { Base } from './base.entity';
import { PagingInput, PagingResult } from './common.entity';
import Address, { AddressCreateInput, AddressUpdateInput } from './address.entity';
import { AdminRole, CompanyRole, entities, UserStatus, Role as RoleEnum } from '../config/constants';
import Task from './task.entity';
import Workschedule from './workschedule.entity';
import { userRolesTable } from '../config/db/columns';
import UserRecord from './user-record.entity';
import UserPayRate from './user-payrate.entity';
import Timesheet from './timesheet.entity';

registerEnumType(UserStatus, {
  name: 'UserStatus',
});

registerEnumType(CompanyRole, {
  name: 'CompanyRole',
});

registerEnumType(AdminRole, {
  name: 'AdminRole',
});

@ObjectType()
@Unique('unique_company_email', ['email', 'company_id'])
@Entity({ name: entities.users })
export default class User extends Base {
  @Field()
  @Column({ length: 64 })
  email: string;

  @Column()
  password: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  phone: string;

  @Field({ nullable: true })
  @Column({ length: 25, name: 'first_name', nullable: true })
  firstName: string;

  @Field({ nullable: true })
  @Column({ length: 25, nullable: true, name: 'middle_name' })
  middleName: string;

  @Field({ nullable: true })
  @Column({ length: 25, name: 'last_name', nullable: true })
  lastName: string;

  @Field({ nullable: true })
  fullName: string;

  @Field((type) => UserStatus)
  @Column({
    type: 'varchar',
    default: UserStatus.Active,
  })
  status: UserStatus;

  @Field()
  @Column({ name: 'archived', default: false })
  archived: boolean;

  @Field({ nullable: true })
  @Column({ nullable: true })
  avatar_id: string;

  @Field(() => Media, { nullable: true })
  @OneToOne(() => Media, { nullable: true, cascade: true })
  @JoinColumn({ name: 'avatar_id' })
  avatar: Media;

  @Field(() => Company, { nullable: true })
  @ManyToOne(() => Company, (company) => company.users)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @Field()
  @Column({ nullable: true })
  company_id: string;

  @Field((type) => [Role])
  @ManyToMany(() => Role)
  @JoinTable({
    name: entities.userRoles,
    joinColumn: {
      name: userRolesTable.user_id,
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: userRolesTable.role_id,
      referencedColumnName: 'id',
    },
  })
  roles: Role[];

  @Field({ nullable: true })
  @Column({ nullable: true })
  address_id: string;

  @Field(() => Address, { nullable: true })
  @JoinColumn({ name: 'address_id' })
  @OneToOne(() => Address, {
    cascade: true,
  })
  address: Address;

  @Field(() => UserToken, { nullable: true })
  @OneToMany(() => UserToken, (token) => token.user)
  tokens: UserToken[];

  @ManyToMany(() => Task)
  assignedTasks: Task[];

  @Field(() => Workschedule, { nullable: true })
  @OneToMany(() => Workschedule, (workschedule) => workschedule.user)
  workschedules: Workschedule[];

  @Field({ nullable: true })
  activeClient: Client;

  @Field(() => UserPayRate, { nullable: true, description: 'Field for UserPayRate' })
  @OneToMany(() => UserPayRate, (userPayRate) => userPayRate.user)
  userPayRate: UserPayRate[];
}

@ObjectType()
export class UserPagingResult {
  @Field()
  paging: PagingResult;

  @Field(() => [User])
  data: User[];
}

@InputType()
export class UserCreateInput {
  @Field()
  email: string;

  @Field()
  phone: string;

  @Field()
  firstName: string;

  @Field({ nullable: true })
  middleName: string;

  @Field()
  lastName: string;

  @Field((type) => UserStatus)
  status: UserStatus;

  @Field()
  company_id: string;

  @Field((type) => AddressCreateInput)
  address: AddressCreateInput;

  @Field((type) => [CompanyRole])
  roles: CompanyRole[];
}

@InputType()
export class UserAdminCreateInput {
  @Field()
  email: string;

  @Field()
  phone: string;

  @Field()
  firstName: string;

  @Field({ nullable: true })
  middleName: string;

  @Field()
  lastName: string;

  @Field((type) => UserStatus)
  status: UserStatus;

  @Field((type) => AddressCreateInput)
  address: AddressCreateInput;

  @Field((type) => [AdminRole])
  roles: AdminRole[];
}

@InputType()
export class UserArchiveInput {
  @Field()
  id: string;

  @Field()
  archived: boolean;

  @Field()
  company_id: string;
}

@InputType()
export class UserUpdateInput {
  @Field()
  id: string;

  @Field({ nullable: true })
  email: string;

  @Field({ nullable: true })
  phone: string;

  @Field({ nullable: true })
  firstName: string;

  @Field({ nullable: true })
  middleName: string;

  @Field({ nullable: true })
  lastName: string;

  @Field((type) => UserStatus, { nullable: true })
  status: UserStatus;

  @Field((type) => AddressUpdateInput, { nullable: true })
  address: AddressUpdateInput;
}

@InputType()
export class UserQuery {
  @Field({ nullable: true })
  id: string;

  @Field({ nullable: true })
  company_id: string;

  @Field({ nullable: true })
  search: string;

  @Field((type) => RoleEnum, { nullable: true })
  role: RoleEnum;

  @Field({ nullable: true, defaultValue: false })
  archived: boolean;
}

@InputType()
export class ChangeProfilePictureInput {
  @Field()
  id: string;

  @Field()
  avatar_id: string;
}

@InputType()
export class UserQueryInput {
  @Field({ nullable: true })
  paging: PagingInput;

  @Field({ nullable: true })
  query: UserQuery;
}
