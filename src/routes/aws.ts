import { Router } from 'express';

import container from '../inversify.config';
import { TYPES } from '../types';
import AWSController from '../controllers/aws.controller';

const _router = () => {
  const router = Router();

  const awsController: AWSController = container.get<AWSController>(TYPES.AWSController);

  router.post('/bounce', awsController.handleBounceAndComplaint);

  return router;
};

export default _router;
