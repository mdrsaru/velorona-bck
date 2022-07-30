import { Entity, Column, OneToMany, OneToOne, JoinColumn, Index } from 'typeorm';
import { ObjectType, Field, ID, InputType, registerEnumType } from 'type-graphql';

import { Base } from './base.entity';
import User, { UserUpdateInput } from './user.entity';
import { entities, CompanyStatus, plans } from '../config/constants';
import { PagingResult, PagingInput } from './common.entity';
import Workschedule from './workschedule.entity';
import Media from './media.entity';

registerEnumType(CompanyStatus, {
  name: 'CompanyStatus',
});

const indexPrefix = 'companies';

@Entity({ name: entities.companies })
@ObjectType()
export default class Company extends Base {
  @Field()
  @Column()
  name: string;

  @Index(`${indexPrefix}_status`)
  @Field((type) => CompanyStatus)
  @Field((type) => CompanyStatus)
  @Column({
    type: 'varchar',
    default: CompanyStatus.Inactive,
  })
  status: CompanyStatus;

  @Index(`${indexPrefix}_archived`)
  @Field()
  @Column({ default: false })
  archived: boolean;

  @Index(`${indexPrefix}_company_code`)
  @Field()
  @Column({ unique: true, name: 'company_code' })
  companyCode: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  logo_id: string;

  @Field(() => Media, { nullable: true })
  @OneToOne(() => Media, { nullable: true, cascade: true })
  @JoinColumn({ name: 'logo_id' })
  logo: Media;

  /**
   * Company main admin email(not needed to be unique as same email can be registered in different companies)
   * If needed, query the user using this email along with the company_id
   */
  @Index(`${indexPrefix}_admin_email`)
  @Field({ description: 'Company main admin email' })
  @Column({ name: 'admin_email' })
  adminEmail: string;

  @Field(() => [User])
  @OneToMany(() => User, (user) => user.company)
  users: User[];

  @Field(() => Workschedule, { nullable: true })
  @OneToMany(() => Workschedule, (workschedule) => workschedule.company)
  workschedules: Workschedule[];

  @Field({ nullable: true })
  @Column({ name: 'stripe_customer_id', type: 'varchar', nullable: true })
  stripeCustomerId: string;

  @Field({ nullable: true })
  @Column({ nullable: true, type: 'varchar', default: plans.Starter })
  plan: string;

  @Index(`${indexPrefix}_subscription_id`)
  @Field({ nullable: true, description: 'Stripe subscription Id' })
  @Column({ name: 'subscription_id', type: 'varchar', nullable: true })
  subscriptionId: string;

  @Field({ nullable: true, description: 'Stripe subscription Item Id for the metered billing' })
  @Column({ name: 'subscription_item_id', type: 'varchar', nullable: true })
  subscriptionItemId: string;

  @Field({ nullable: true, description: 'Status of subscription' })
  @Column({ name: 'subscription_status', type: 'varchar', nullable: true })
  subscriptionStatus: string;

  @Field(() => User)
  admin: User;
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
  country?: string;

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
@InputType()
export class CompanyAdminInformationInput {
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
export class CompanyAdminInput extends CompanyAdminInformationInput {
  @Field()
  email: string;
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

  @Field({ nullable: true })
  logo_id: string;
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

  @Field({ nullable: true })
  logo_id: string;

  @Field({ nullable: true })
  user: UserUpdateInput;
}

@InputType()
export class CompanyQuery {
  @Field({ nullable: true })
  id: string;

  @Field({ nullable: true })
  companyCode: string;

  @Field({ nullable: true })
  archived: boolean;

  @Field({ nullable: true })
  search: string;

  @Field({ nullable: true })
  status: string;
}

@InputType()
export class CompanyQueryInput {
  @Field({ nullable: true })
  paging: PagingInput;

  @Field({ nullable: true })
  query: CompanyQuery;
}

@InputType()
export class CompanyCountInput {
  @Field({ nullable: true })
  companyCode: string;
}

@InputType()
export class CompanyByIdInput {
  @Field()
  id: string;
}

@ObjectType()
export class CompanyGrowthOutput {
  @Field({ nullable: true })
  count: string;

  @Field({ nullable: true })
  createdAt: Date;
}
