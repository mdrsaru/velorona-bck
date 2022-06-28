import express, { Request, Router } from 'express';

import { TYPES } from '../types';
import container from '../inversify.config';
import WebhookController from '../controllers/webhook.controller';

import config from '../config/constants';

const _router = () => {
  const router = Router();
  const webhookController: WebhookController = container.get<WebhookController>(TYPES.WebhookController);

  router.post('/stripe', webhookController.stripe);
  return router;
};

export default _router;
