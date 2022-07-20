import { Field, InputType, ObjectType } from 'type-graphql';
import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { entities } from '../config/constants';
import { Base } from './base.entity';
import { PagingInput, PagingResult } from './common.entity';
import Company from './company.entity';
import { workschedule } from '../config/db/columns';
import WorkscheduleDetail from './workschedule-details.entity';

const indexPrefix = 'workschedule';
@ObjectType()
@Entity({ name: entities.workschedule })
export default class Workschedule extends Base {
  @Index(`${indexPrefix}_start_date`)
  @Field()
  @Column({ name: workschedule.start_date })
  startDate: Date;

  @Index(`${indexPrefix}_end_date`)
  @Field()
  @Column({ name: workschedule.end_date })
  endDate: Date;

  @Field({ nullable: true })
  @Column({ nullable: true, name: workschedule.payroll_allocated_hours })
  payrollAllocatedHours: Number;

  @Field({ nullable: true })
  @Column({ nullable: true, name: workschedule.payroll_usuage_hours })
  payrollUsageHours: Number;

  @Index(`${indexPrefix}_status`)
  @Field()
  @Column()
  status: string;

  @Field()
  @Column()
  company_id: string;

  @Field(() => Company)
  @ManyToOne(() => Company)
  @JoinColumn({ name: workschedule.company_id })
  company: Company;

  @Field(() => WorkscheduleDetail, { nullable: true, description: 'Field for WorkscheduleTimeDetail' })
  @OneToMany(() => WorkscheduleDetail, (workscheduleDetail) => workscheduleDetail.workschedule, {
    cascade: ['remove', 'update'],
  })
  WorkscheduleDetail: WorkscheduleDetail[];
}

@ObjectType()
export class WorkschedulePagingResult {
  @Field()
  paging: PagingResult;

  @Field(() => [Workschedule])
  data: Workschedule[];
}

@InputType()
export class WorkscheduleCreateInput {
  @Field()
  startDate: Date;

  @Field()
  endDate: Date;

  @Field({ nullable: true })
  payrollAllocatedHours: Number;

  @Field({ nullable: true })
  payrollUsageHours: Number;

  @Field()
  status: string;

  @Field()
  company_id: string;
}

@InputType()
export class WorkscheduleUpdateInput {
  @Field()
  id: string;

  @Field({ nullable: true })
  startDate: Date;

  @Field({ nullable: true })
  endDate: Date;

  @Field({ nullable: true })
  payrollAllocatedHours: Number;

  @Field({ nullable: true })
  payrollUsageHours: Number;

  @Field({ nullable: true })
  status: string;

  @Field({ nullable: true })
  company_id: string;
}

@InputType()
export class WorkscheduleQuery {
  @Field({ nullable: true })
  id: string;

  @Field({ nullable: true })
  company_id: string;
}

@InputType()
export class WorkscheduleQueryInput {
  @Field({ nullable: true })
  paging: PagingInput;

  @Field({ nullable: true })
  query: WorkscheduleQuery;
}
