import express, { Application } from 'express';

import appRouter from './app';
import tokenRouter from './token';
import mediaRouter from './media';
import authenticate from '../middlewares/authenticate';

const routes = () => {
  const app: express.Application = express();

  app.use('/', appRouter());
  app.use('/token', tokenRouter());
  app.use('/media', authenticate, mediaRouter());

  return app;
};

export default routes;
