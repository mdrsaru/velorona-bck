import Media from '../entities/media.entity';

export interface IMediaUpload {
  file: any;
}
export interface IMediaService {
  upload(args: IMediaUpload): Promise<Media>;
}

export interface IMediaRepository {
  upload(args: IMediaUpload): Promise<Media>;
}
