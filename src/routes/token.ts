import { Router } from 'express';

import { TYPES } from '../types';
import container from '../inversify.config';
import TokenController from '../controllers/token.controller';

const _router = () => {
  const router = Router();
  const tokenController: TokenController = container.get<TokenController>(TYPES.UserTokenController);

  router.post('/refresh', tokenController.renewAccessToken);
  return router;
};

export default _router;
