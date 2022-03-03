import { Application } from 'express';
import cors, { CorsOptions } from 'cors';
import { ApolloServer } from 'apollo-server-express';
import { applyMiddleware } from 'graphql-middleware';
import {
  ApolloServerPluginLandingPageGraphQLPlayground,
  ApolloServerPluginLandingPageDisabled,
} from 'apollo-server-core';

import container from '../inversify.config';
import { IGraphql } from '../interfaces/graphql.interface';
import { TYPES } from '../types';
import constants from '../config/constants';

let graphqlService: IGraphql = container.get<IGraphql>(TYPES.GraphqlService);

export default async ({ app, schema }: { app: Application; schema: any }): Promise<void> => {
  const apollo = new ApolloServer({
    schema: applyMiddleware(await schema),
    formatError: graphqlService.formatError,
    context: graphqlService.setContext,
    plugins: [
      constants.env === 'production'
        ? ApolloServerPluginLandingPageDisabled()
        : ApolloServerPluginLandingPageGraphQLPlayground(),
    ],
  });

  await apollo.start();

  apollo.applyMiddleware({
    app,
    path: '/v1/graphql',
    cors: false,
  });
};
