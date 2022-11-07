import { inject, injectable } from 'inversify';
import { Express, Request, Response, NextFunction } from 'express';
import { Multer } from 'multer';
import AWS from 'aws-sdk';

import { TYPES } from '../types';
import { aws } from '../config/constants';
import * as apiError from '../utils/api-error';
import { IMediaService } from '../interfaces/media.interface';
import { IUploadService } from '../interfaces/common.interface';

interface IFileRequest extends Request {
  file: Express.Multer.File;
}

const S3 = new AWS.S3({
  accessKeyId: aws.accessKeyId,
  secretAccessKey: aws.secretAccessKey,
  signatureVersion: 'v4',
});

@injectable()
export default class MediaController {
  private mediaService: IMediaService;
  private uploadService: IUploadService;

  constructor(
    @inject(TYPES.MediaService) _mediaService: IMediaService,
    @inject(TYPES.UploadService) _uploadService: IUploadService
  ) {
    this.mediaService = _mediaService;
    this.uploadService = _uploadService;
  }

  uploadImage = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        throw new apiError.ValidationError({
          details: ['File is required'],
        });
      }

      const url = await this.uploadService.upload({
        file: req.file,
      });

      let media = await this.mediaService.create({
        url,
        name: req.file.originalname,
      });

      return res.status(200).send({
        message: 'OK',
        data: media,
      });
    } catch (err) {
      console.log(err, 'err');
      next(err);
    }
  };
}
