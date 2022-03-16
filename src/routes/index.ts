import express, { Application } from 'express';

import appRouter from './app';
import tokenRouter from './token';

const routes = () => {
  const app: express.Application = express();

  app.use('/', appRouter());
  app.use('/token', tokenRouter());

  return app;
};

export default routes;
