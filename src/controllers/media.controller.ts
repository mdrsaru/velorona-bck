import { inject, injectable } from 'inversify';
import { Request, Response, NextFunction } from 'express';

import { TYPES } from '../types';
import { IMediaService } from '../interfaces/media.interface';

@injectable()
export default class MediaController {
  private mediaService: IMediaService;

  constructor(@inject(TYPES.MediaService) mediaService: IMediaService) {
    this.mediaService = mediaService;
  }

  uploadImage = async (req: Request, res: Response, next: NextFunction) => {
    try {
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
