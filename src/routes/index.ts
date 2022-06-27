import express, { Application } from 'express';
import bodyParser from 'body-parser';

import appRouter from './app';
import tokenRouter from './token';
import mediaRouter from './media';
import webhookRouter from './webhook';
import authenticate from '../middlewares/authenticate';

const routes = () => {
  const app: express.Application = express();

  app.use('/', appRouter());
  app.use('/token', tokenRouter());
  app.use('/media', authenticate, mediaRouter());
  app.use('/webhook', webhookRouter());

  return app;
};

export default routes;
