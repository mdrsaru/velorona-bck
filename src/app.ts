import express, { Application, Response } from 'express';

import schema from './graphql/schema';
import corsLoader from './loaders/cors.loader';
import expressLoader from './loaders/express.loader';
import graphqlLoader from './loaders/graphql.loader';
import typeormLoader from './loaders/typeorm.loader';
import './loaders/event.loader';

const app: Application = express();

(async () => {
  await typeormLoader();

  app.get('/', (_: any, res: Response) => {
    const env = process.env.NODE_ENV;
    if (env === 'production') {
      return res.redirect('/v1/status');
    }

    return res.redirect('/v1/docs');
  });

  app.use('/v1', express.static(`${__dirname}/../public`));
  app.use('/uploads', express.static(`${__dirname}/../public/uploads`));

  corsLoader({ app });
  graphqlLoader({ app, schema });
  expressLoader({ app });
})();

export default app;
