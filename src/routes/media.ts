import { Request, Router } from 'express';
import multer from 'multer';
import path from 'path';

import { TYPES } from '../types';
import container from '../inversify.config';
import MediaController from '../controllers/media.controller';

import config from '../config/constants';

export const upload = multer().single('file');

const _router = () => {
  const router = Router();
  const mediaController: MediaController = container.get<MediaController>(TYPES.MediaController);

  router.post('/upload', upload, mediaController.uploadImage);
  return router;
};

export default _router;
