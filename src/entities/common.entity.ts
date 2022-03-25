import { Field, InputType, ObjectType, Int } from 'type-graphql';

@InputType()
export class DeleteInput {
  @Field()
  id: string;
}

@InputType()
export class PagingInput {
  @Field((type) => Int, { nullable: true, description: 'Number to skip' })
  skip: number;

  @Field((type) => Int, {
    nullable: true,
    description: 'Limit - max number of entities that should be taken',
  })
  take: number;

  @Field((type) => [String], { nullable: true, description: 'Sort order' })
  order?: string[];
}

@ObjectType()
export class PagingResult {
  @Field((type) => Int, {
    description: 'Total number of entities with the provided filter/query',
  })
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
