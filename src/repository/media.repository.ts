import { injectable } from 'inversify';
import { getRepository } from 'typeorm';
import Media from '../entities/media.entity';
import { IMediaRepository, IMediaUpload } from '../interfaces/media.interface';
import BaseRepository from './base.repository';

import config from '../config/constants';
@injectable()
export default class MediaRepository extends BaseRepository<Media> implements IMediaRepository {
  constructor() {
    super(getRepository(Media));
  }

  upload = async (args: IMediaUpload): Promise<Media> => {
    try {
      const url = config.baseUrl + '/uploads/' + args.file.filename;
      const name = args.file.filename;
      const media = await this.repo.save({
        name,
        url,
      });

      return media;
    } catch (err) {
      throw err;
    }
  };
}
