import { Entity, Column, ManyToOne, JoinColumn, ManyToMany, JoinTable, OneToOne, RelationId, OneToMany } from 'typeorm';
import { ObjectType, Field, ID, InputType, registerEnumType } from 'type-graphql';

import Company from './company.entity';
import Role from './role.entity';
import UserToken from './user-token.entity';
import Media from './media.entity';
import { Base } from './base.entity';
import { PagingInput, PagingResult } from './common.entity';
import Address, { AddressCreateInput, AddressUpdateInput } from './address.entity';
import UserRecord, { UserRecordCreateInput, UserRecordUpdateInput } from './user-record.entity';
import { AdminRole, CompanyRole, entities, UserStatus, Role as RoleEnum } from '../config/constants';
import Task from './task.entity';
import Workschedule from './workschedule.entity';
import { userRolesTable } from '../config/db/columns';

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
@Entity({ name: entities.users })
export default class User extends Base {
  @Field()
  @Column({ length: 64 })
  email: string;

  @Column()
  password: string;

  @Field()
  @Column({ length: 10 })
  phone: string;

  @Field()
  @Column({ length: 25, name: 'first_name' })
  firstName: string;

  @Field({ nullable: true })
  @Column({ length: 25, nullable: true, name: 'middle_name' })
  middleName: string;

  @Field()
  @Column({ length: 25, name: 'last_name' })
  lastName: string;

  @Field()
  fullName: string;

  @Field((type) => UserStatus)
  @Column({
    type: 'enum',
    enum: UserStatus,
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

  @Field(() => Address)
  @OneToOne(() => Address, (address) => address.user, {
    cascade: true,
  })
  address: Address;

  @Field(() => UserToken, { nullable: true })
  @OneToMany(() => UserToken, (token) => token.user)
  tokens: UserToken[];

  @Field(() => UserRecord, { nullable: true })
  @OneToOne(() => UserRecord, (record) => record.user, {
    cascade: true,
  })
  record: UserRecord;

  @ManyToMany(() => Task)
  assignedTasks: Task[];

  @Field(() => Workschedule, { nullable: true })
  @OneToMany(() => Workschedule, (workschedule) => workschedule.user)
  workschedules: Workschedule[];
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

  @Field((type) => UserRecordCreateInput)
  record: UserRecordCreateInput;
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

  @Field((type) => UserRecordUpdateInput, { nullable: true })
  record: UserRecordUpdateInput;
}

@InputType()
export class UserQuery {
  @Field({ nullable: true })
  id: string;

  @Field({ nullable: true })
  search: string;

  @Field((type) => RoleEnum, { nullable: true })
  role: RoleEnum;
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
