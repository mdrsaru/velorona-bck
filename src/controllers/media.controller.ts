import { inject, injectable } from 'inversify';
import { Express, Request, Response, NextFunction } from 'express';
import { Multer } from 'multer';

import { TYPES } from '../types';
import { IMediaService } from '../interfaces/media.interface';

interface IFileRequest extends Request {
  file: Express.Multer.File;
}

@injectable()
export default class MediaController {
  private mediaService: IMediaService;

  constructor(@inject(TYPES.MediaService) mediaService: IMediaService) {
    this.mediaService = mediaService;
  }

  uploadImage = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const _req = req as IFileRequest;
      let createdMedia = await this.mediaService.upload({ file: req.file });
      return res.status(200).send({
        message: 'OK',
        data: createdMedia,
      });
    } catch (err) {
      next(err);
    }
  };
}
