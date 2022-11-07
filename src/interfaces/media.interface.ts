import Media from '../entities/media.entity';

export interface IMediaCreateInput {
  name: string;
  url: string;
}

export interface IMediaService {
  create(args: IMediaCreateInput): Promise<Media>;
}

export interface IMediaRepository {
  create(args: IMediaCreateInput): Promise<Media>;
  getAll(args: any): Promise<Media[]>;
  getMediaByTaskIds(task_ids: string[]): Promise<Media[]>;
}
