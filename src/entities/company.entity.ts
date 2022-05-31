import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Unique,
} from 'typeorm';
import { ObjectType, Field, ID, InputType, registerEnumType } from 'type-graphql';

import { Base } from './base.entity';
import User from './user.entity';
import { entities, CompanyStatus } from '../config/constants';
import { PagingResult, PagingInput } from './common.entity';
import Workschedule from './workschedule.entity';

registerEnumType(CompanyStatus, {
  name: 'CompanyStatus',
});

@Entity({ name: entities.companies })
@ObjectType()
export default class Company extends Base {
  @Field()
  @Column()
  name: string;
  @Field((type) => CompanyStatus)
  @Field((type) => CompanyStatus)
  @Column({
    type: 'enum',
    enum: CompanyStatus,
    default: CompanyStatus.Inactive,
  })
  status: CompanyStatus;

  @Field()
  @Column({ default: false })
  archived: boolean;

  @Field()
  @Column({ unique: true, name: 'company_code' })
  companyCode: string;

  @Field({ description: 'Company main admin email' })
  @Column({ name: 'admin_email' })
  adminEmail: string;

  @Field(() => [User])
  @OneToMany(() => User, (user) => user.company)
  users: User[];

  @Field(() => Workschedule, { nullable: true })
  @OneToMany(() => Workschedule, (workschedule) => workschedule.tasks)
  workschedules: Workschedule[];
}

@ObjectType()
export class CompanyPagingResult {
  @Field()
  paging: PagingResult;

  @Field(() => [Company])
  data: Company[];
}

@InputType()
export class CompanyAdminAddressInput {
  @Field({ nullable: true })
  streetAddress?: string;

  @Field({ nullable: true })
  aptOrSuite?: string;

  @Field({ nullable: true })
  city?: string;

  @Field({ nullable: true })
  state?: string;

  @Field({ nullable: true })
  zipcode?: string;
}

@InputType()
export class CompanyAdminInput {
  @Field()
  email: string;

  @Field({ nullable: true })
  firstName: string;

  @Field({ nullable: true })
  lastName: string;

  @Field({ nullable: true })
  middleName: string;

  @Field({ nullable: true })
  phone: string;

  @Field({ nullable: true })
  status: string;

  @Field({ nullable: true })
  address: CompanyAdminAddressInput;
}

@InputType()
export class CompanyCreateInput {
  @Field()
  name: string;

  @Field((type) => CompanyStatus)
  status: CompanyStatus;

  @Field({ nullable: true })
  archived: boolean;

  @Field()
  user: CompanyAdminInput;
}

@InputType()
export class CompanyUpdateInput {
  @Field()
  id: string;

  @Field({ nullable: true })
  name: string;

  @Field((type) => CompanyStatus, { nullable: true })
  status: CompanyStatus;

  @Field({ nullable: true })
  archived: boolean;
}

@InputType()
export class CompanyQuery {
  @Field({ nullable: true })
  id: string;

  @Field({ nullable: true })
  companyCode: string;

  @Field({ nullable: true })
  archived: boolean;
}

@InputType()
export class CompanyQueryInput {
  @Field({ nullable: true })
  paging: PagingInput;

  @Field({ nullable: true })
  query: CompanyQuery;
}
