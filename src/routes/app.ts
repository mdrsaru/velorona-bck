import { Router } from 'express';

import container from '../inversify.config';
import { TYPES } from '../types';
import AppController from '../controllers/app.controller';

const _router = () => {
  const router = Router();

  const appController = container.get<AppController>(TYPES.AppController);

  router.get('/status', appController.getStatus);
  router.get('/error/500', appController.getAppError);

  return router;
};

export default _router;
