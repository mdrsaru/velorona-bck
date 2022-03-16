import { Application } from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';

import routes from '../routes';
import errorHandler from '../middlewares/error-handler';

export default async ({ app }: { app: Application }): Promise<void> => {
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());
  app.use(bodyParser.text({ type: 'text/plain' }));
  app.use(cookieParser());

  app.use('/v1', routes());
  app.use(errorHandler);
};
