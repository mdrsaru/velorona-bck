import { Application } from 'express';
import cors, { CorsOptions } from 'cors';
import constants from '../config/constants';

export default ({ app }: { app: Application }): void => {
  const origins = constants.origins;

  const corsOptions: CorsOptions = {
    origin: origins,
    credentials: true,
  };

  app.use(cors(corsOptions));
};
