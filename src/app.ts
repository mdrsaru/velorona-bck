import express, { Application, Response } from 'express';

import schema from './graphql/schema';
import loaders from './loaders';

const app: Application = express();

app.get('/', (_: any, res: Response) => {
  const env = process.env.NODE_ENV;
  if (env === 'production') {
    return res.redirect('/v1/status');
  }

  return res.redirect('/v1/docs');
});

app.use('/v1', express.static(`${__dirname}/../public`));
loaders({ app, schema });

export default app;
