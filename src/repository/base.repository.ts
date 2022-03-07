import { unmanaged, injectable } from 'inversify';

import { Repository } from 'typeorm';

import { IPagingArgs, IGetAllAndCountResult } from '../interfaces/paging.interface';
import { IBaseRepository, IEntityID, IEntityRemove } from '../interfaces/common.interface';
import { NotFoundError } from '../utils/api-error';

export default class BaseRepository<T> implements IBaseRepository<T> {
  protected repo: Repository<T>;

  constructor(@unmanaged() repo: Repository<T>) {
    this.repo = repo;
  }

  getAllAndCount = async (args: IPagingArgs): Promise<IGetAllAndCountResult<T>> => {
    const query = args?.query ?? {};
    const rows = await this.repo.find({
      where: query,
    });

    return {
      count: 0,
      rows,
    };
  };

  async getAll(args: any = {}): Promise<T[]> {
    try {
      const rows = await this.repo.find({
        where: args,
      });

      return rows;
    } catch (err) {
      throw err;
    }
  }

  async getById(args: IEntityID): Promise<T | undefined> {
    try {
      const row = await this.repo.findOne(args.id);
      return row;
    } catch (err) {
      throw err;
    }
  }

  async remove(args: IEntityRemove): Promise<T> {
    try {
      const row = await this.repo.findOne(args.id);

      if (!row) {
        throw new NotFoundError({
          details: ['Resource not found'],
        });
      }

      await this.repo.delete(args.id);
      return row;
    } catch (err) {
      throw err;
    }
  }
}
