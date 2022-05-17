import { graphql, GraphQLArgs } from 'graphql';
import { ApolloServer } from 'apollo-server-express';
import { applyMiddleware } from 'graphql-middleware';
import { Request } from 'express';

import container from '../../inversify.config';
import schema from '../../graphql/schema';
import { TYPES } from '../../types';
import constants from '../../config/constants';
import User from '../../entities/user.entity';

import { IGraphql } from '../../interfaces/graphql.interface';

type Maybe<T> = undefined | T;

type GraphqlRequestArgs = {
  query: string;
  variables?: Maybe<{ [key: string]: any }>;

  /**
   * Logged in user
   */
  user?: User;
  bearer?: string;
};

const graphqlRequest = async (args: GraphqlRequestArgs) => {
  const graphqlService: IGraphql = container.get<IGraphql>(TYPES.GraphqlService);

  const apollo = new ApolloServer({
    schema: applyMiddleware(await schema),
    formatError: graphqlService.formatError,
    context: (args: any) => {
      const ctx = graphqlService.setContext(args);
      return {
        ...ctx,
        user: args?.user ?? {},
      };
    },
  });

  return apollo.executeOperation({
    query: args.query,
    variables: args.variables,
  });
};

export default graphqlRequest;
