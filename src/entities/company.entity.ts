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
import { entities, CompanyStatus } from '../config/constants';
import { PagingResult, PagingInput } from './common.entity';
import Workschedule from './workschedule.entity';
import Timesheet from './timesheet.entity';

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
  @Column({
    type: 'enum',
    enum: CompanyStatus,
    default: CompanyStatus.Inactive,
  })
  status: CompanyStatus;

  @Field()
  @Column({ name: 'archived', default: false })
  archived: boolean;

  @Field()
  @Column({ unique: true, name: 'company_code' })
  companyCode: string;

  @Field(() => [User])
  @OneToMany(() => User, (user) => user.company)
  users: User[];

  @Field(() => Workschedule, { nullable: true })
  @OneToMany(() => Workschedule, (workschedule) => workschedule.tasks)
  workschedules: Workschedule[];

  @Field(() => Timesheet, { nullable: true, description: 'Field for company timesheet' })
  @OneToMany(() => Timesheet, (timesheet) => timesheet.company)
  companyTimesheet: Timesheet[];
}

@ObjectType()
export class CompanyPagingResult {
  @Field()
  paging: PagingResult;

  @Field(() => [Company])
  data: Company[];
}

@InputType()
export class CompanyCreateInput {
  @Field()
  name: string;

  @Field((type) => CompanyStatus)
  status: CompanyStatus;

  @Field({ nullable: true })
  archived: boolean;
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
