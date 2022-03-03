import { Application } from 'express';

import corsLoader from './cors.loader';
import expressLoader from './express.loader';
import graphqlLoader from './graphql.loader';
import typeormLoader from './typeorm.loader';

export default async ({ app, schema }: { app: Application; schema: any }): Promise<void> => {
  corsLoader({ app });
  graphqlLoader({ app, schema });
  expressLoader({ app });
  await typeormLoader();
};
