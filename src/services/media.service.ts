import { inject, injectable } from 'inversify';

import { TYPES } from '../types';
import Media from '../entities/media.entity';

import { IMediaRepository, IMediaService, IMediaCreateInput } from '../interfaces/media.interface';

@injectable()
export default class MediaService implements IMediaService {
  private name = 'MediaService';
  private mediaRepository: IMediaRepository;

  constructor(@inject(TYPES.MediaRepository) mediaRepository: IMediaRepository) {
    this.mediaRepository = mediaRepository;
  }

  create = async (args: IMediaCreateInput): Promise<Media> => {
    try {
      return await this.mediaRepository.create(args);
    } catch (err) {
      throw err;
    }
  };
}
