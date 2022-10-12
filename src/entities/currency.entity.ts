import { Field, InputType, ObjectType } from 'type-graphql';
import { Column, Entity } from 'typeorm';
import { entities } from '../config/constants';
import { Base } from './base.entity';
import { PagingInput, PagingResult } from './common.entity';

@Entity({ name: entities.currency })
@ObjectType()
export default class Currency extends Base {
  @Field()
  @Column()
  name: string;

  @Field()
  @Column({ type: 'varchar', length: 12 })
  symbol: string;
}

@ObjectType()
export class CurrencyPagingResult {
  @Field()
  paging: PagingResult;

  @Field(() => [Currency])
  data: Currency[];
}

@InputType()
export class CurrencyCreateInput {
  @Field()
  name: string;

  @Field({ nullable: true })
  symbol: string;
}

@InputType()
export class CurrencyUpdateInput {
  @Field()
  id: string;

  @Field({ nullable: true })
  name: string;

  @Field({ nullable: true })
  symbol: string;
}

@InputType()
export class CurrencyQuery {
  @Field({ nullable: true })
  id: string;

  @Field({ nullable: true })
  name: string;
}

@InputType()
export class CurrencyQueryInput {
  @Field({ nullable: true })
  paging: PagingInput;

  @Field({ nullable: true })
  query: CurrencyQuery;
}
