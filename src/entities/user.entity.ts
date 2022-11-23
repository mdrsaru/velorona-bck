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
  Index,
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
import { AdminRole, CompanyRole, entities, UserStatus, Role as RoleEnum, EntryType } from '../config/constants';
import Workschedule from './workschedule.entity';
import { userProjectTable, userRolesTable } from '../config/db/columns';
import UserPayRate from './user-payrate.entity';
import Timesheet from './timesheet.entity';

const indexPrefix = 'user';

registerEnumType(UserStatus, {
  name: 'UserStatus',
});

registerEnumType(CompanyRole, {
  name: 'CompanyRole',
});

registerEnumType(AdminRole, {
  name: 'AdminRole',
});

registerEnumType(EntryType, {
  name: 'EntryType',
});

@ObjectType()
@Unique('unique_company_email', ['email', 'company_id'])
@Entity({ name: entities.users })
export default class User extends Base {
  @Index(`${indexPrefix}_email`)
  @Field()
  @Column({ length: 64 })
  email: string;

  @Column()
  password: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  phone: string;

  @Index(`${indexPrefix}_first_name`)
  @Field({ nullable: true })
  @Column({ length: 25, name: 'first_name', nullable: true })
  firstName: string;

  @Field({ nullable: true })
  @Column({ length: 25, nullable: true, name: 'middle_name' })
  middleName: string;

  @Index(`${indexPrefix}_last_name`)
  @Field({ nullable: true })
  @Column({ length: 25, name: 'last_name', nullable: true })
  lastName: string;

  @Field({ nullable: true })
  fullName: string;

  @Index(`${indexPrefix}_designation`)
  @Field({ nullable: true })
  @Column({ length: 25, name: 'designation', nullable: true })
  designation: string;

  @Index(`${indexPrefix}_status`)
  @Field((type) => UserStatus)
  @Column({
    type: 'varchar',
    default: UserStatus.InvitationSent,
  })
  status: UserStatus;

  @Index(`${indexPrefix}_type`)
  @Field((type) => EntryType, { nullable: true })
  @Column({
    name: 'entry_type',
    type: 'varchar',
    nullable: true,
  })
  entryType: EntryType;

  @Index(`${indexPrefix}_archived`)
  @Field()
  @Column({ name: 'archived', default: false })
  archived: boolean;

  @Index(`${indexPrefix}_loggedIn`)
  @Field()
  @Column({ name: 'logged_in', default: false })
  loggedIn: boolean;

  @Field({ nullable: true })
  @Column({ nullable: true })
  avatar_id: string;

  @Index(`${indexPrefix}_start_date_index`)
  @Field({ nullable: true })
  @Column({ nullable: true, name: 'start_date' })
  startDate: Date;

  @Index(`${indexPrefix}_end_date_index`)
  @Field({ nullable: true })
  @Column({ nullable: true, name: 'end_date' })
  endDate: Date;

  @Index(`${indexPrefix}_timesheet_attachment_index`)
  @Field({ nullable: true })
  @Column({ nullable: true, name: 'timesheet_attachment', default: false })
  timesheet_attachment: boolean;

  @Field(() => Media, { nullable: true })
  @OneToOne(() => Media, { nullable: true, cascade: true })
  @JoinColumn({ name: 'avatar_id' })
  avatar: Media;

  @Field(() => Company, { nullable: true })
  @ManyToOne(() => Company, (company) => company.users)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @Index(`${indexPrefix}_company_id`)
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

  @Field((type) => Client, { nullable: true })
  activeClient: Client;

  @Field(() => UserPayRate, { nullable: true, description: 'Field for UserPayRate' })
  @OneToMany(() => UserPayRate, (userPayRate) => userPayRate.user)
  userPayRate: UserPayRate[];

  @Field(() => User, { nullable: true })
  @ManyToOne(() => User, (user) => user.employees, { nullable: true })
  @JoinColumn({ name: 'manager_id' })
  manager: User;

  @Index(`${indexPrefix}_manager_id`)
  @Field({ nullable: true })
  @Column({ nullable: true })
  manager_id: string;

  @Field(() => [User])
  @OneToMany(() => User, (user) => user.manager)
  employees: User[];
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

  @Field({ nullable: true })
  startDate: Date;

  @Field({ nullable: true })
  endDate: Date;

  @Field({ nullable: true })
  timesheet_attachment: boolean;

  @Field((type) => UserStatus)
  status: UserStatus;

  @Field((type) => EntryType, { nullable: true })
  entryType: EntryType;

  @Field()
  company_id: string;

  @Field({ nullable: true })
  designation: string;

  @Field((type) => AddressCreateInput)
  address: AddressCreateInput;

  @Field((type) => [CompanyRole])
  roles: CompanyRole[];

  @Field({ nullable: true })
  manager_id: string;
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
export class UserArchiveOrUnArchiveInput {
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

  @Field({ nullable: true })
  designation: string;

  @Field({ nullable: true })
  startDate: Date;

  @Field({ nullable: true })
  endDate: Date;

  @Field((type) => [CompanyRole], { nullable: true })
  roles: CompanyRole[];

  @Field({ nullable: true })
  timesheet_attachment: boolean;

  @Field((type) => UserStatus, { nullable: true })
  status: UserStatus;

  @Field((type) => AddressUpdateInput, { nullable: true })
  address: AddressUpdateInput;

  @Field((type) => EntryType, { nullable: true })
  entryType: EntryType;

  @Field({ nullable: true })
  manager_id: string;
}

@InputType()
export class AttachProjectInput {
  @Field(() => [String], { nullable: true })
  user_id: string[];

  @Field(() => [String], { nullable: true })
  project_ids: string[];
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

  @Field({ nullable: true })
  status: UserStatus;

  @Field({ nullable: true })
  entryType: EntryType;

  @Field({ nullable: true })
  designation: string;
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

@InputType()
export class UserCountInput {
  @Field()
  company_id: string;

  @Field({ nullable: true, defaultValue: false })
  archived: string;

  @Field({ nullable: true })
  manager_id: string;

  @Field({ nullable: true })
  role: string;
}

@InputType()
export class UserCountByAdminInput {
  @Field({ nullable: true })
  company_id: string;
}
