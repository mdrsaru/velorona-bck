import { Request, Router } from 'express';
import multer from 'multer';
import path from 'path';

import { TYPES } from '../types';
import container from '../inversify.config';
import MediaController from '../controllers/media.controller';

import config from '../config/constants';

let storage = multer.diskStorage({
  destination: config.mediaDestination,
  filename: (req: Request, file: any, cb: any) => {
    cb(
      null,
      file.fieldname + '-' + Date.now() + path.extname(file.originalname)
    );
  },
});

const checkFileType = (file: any, cb: any) => {
  switch (file.mimetype) {
    case 'image/jpeg':
    case 'image/png':
    case 'image/jpg':
    case 'image/JPG':
    case 'image/JPEG':
    case 'image/PNG':
      return cb(null, true);
    default:
      cb('You can upload only image files! Supported types - jpeg/png/jpg');
  }
};

export const upload = multer({
  storage: storage,
  limits: { fileSize: config.fileSize },
  fileFilter: (req: Request, file: any, cb: any) => {
    checkFileType(file, cb);
  },
}).single('file');

const _router = () => {
  const router = Router();
  const mediaController: MediaController = container.get<MediaController>(
    TYPES.MediaController
  );

  router.post('/upload', upload, mediaController.uploadImage);
  return router;
};

export default _router;
