import { Field, InputType, ObjectType, Int } from 'type-graphql';

@InputType()
export class DeleteInput {
  @Field()
  id: string;
}

@InputType()
export class PagingInput {
  @Field({ nullable: true })
  skip: number;

  @Field({ nullable: true })
  take: number;

  @Field((type) => [String], { nullable: true })
  order: string[];
}

@ObjectType()
export class PagingResult {
  @Field((type) => Int)
  total: number;

  @Field((type) => Int)
  startIndex: number;

  @Field((type) => Int)
  endIndex: number;

  @Field()
  hasNextPage: boolean;
}

@ObjectType()
export class MessageResponse {
  @Field()
  message: string;
}
