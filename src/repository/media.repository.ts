import { injectable } from 'inversify';
import { getRepository } from 'typeorm';

import config, { entities } from '../config/constants';
import Media from '../entities/media.entity';
import Task from '../entities/task.entity';
import { IMediaRepository, IMediaUpload } from '../interfaces/media.interface';
import BaseRepository from './base.repository';

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

  getMediaByTaskIds = async (task_ids: string[]): Promise<Media[]> => {
    try {
      let media = await this.repo
        .createQueryBuilder(entities.media)
        .select(['media', 'tasks.id'])
        .innerJoinAndSelect('media.tasks', 'tasks')
        .where('tasks.id IN (:...task_ids)', { task_ids })
        .getMany();

      return media;
    } catch (err) {
      throw err;
    }
  };
}
