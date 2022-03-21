import express, { Application } from 'express';

import appRouter from './app';
import tokenRouter from './token';
import mediaRouter from './media';

const routes = () => {
  const app: express.Application = express();

  app.use('/', appRouter());
  app.use('/token', tokenRouter());
  app.use('/media', mediaRouter());

  return app;
};

export default routes;
