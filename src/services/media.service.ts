import { inject, injectable } from 'inversify';
import { IMediaRepository, IMediaService } from '../interfaces/media.interface';
import { TYPES } from '../types';

@injectable()
export default class MediaService implements IMediaService {
  private name = 'MediaService';
  private mediaRepository: IMediaRepository;

  constructor(@inject(TYPES.MediaRepository) mediaRepository: IMediaRepository) {
    this.mediaRepository = mediaRepository;
  }

  upload = async (args: any): Promise<any> => {
    try {
      return await this.mediaRepository.upload(args);
    } catch (err) {
      throw err;
    }
  };
}
