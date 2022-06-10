import { unmanaged, injectable } from 'inversify';
import isArray from 'lodash/isArray';

import { Repository, In } from 'typeorm';

import strings from '../config/strings';
import { IPagingArgs, IGetAllAndCountResult, IGetOptions } from '../interfaces/paging.interface';
import { IBaseRepository, IEntityID, IEntityRemove, ISingleEntityQuery } from '../interfaces/common.interface';
import { ValidationError, NotFoundError } from '../utils/api-error';

export default class BaseRepository<T> implements IBaseRepository<T> {
  protected repo: Repository<T>;

  constructor(@unmanaged() repo: Repository<T>) {
    this.repo = repo;
  }

  getAllAndCount = async (args: IGetOptions): Promise<IGetAllAndCountResult<T>> => {
    try {
      let { query = {}, select = [], ...rest } = args;

      const _select = select as (keyof T)[];

      // For array values to be used as In operator
      // https://github.com/typeorm/typeorm/blob/master/docs/find-options.md
      for (let key in query) {
        if (isArray(query[key])) {
          query[key] = In(query[key]);
        }
      }

      const [rows, count] = await this.repo.findAndCount({
        where: query,
        ...(_select?.length && { select: _select }),
        ...rest,
      });
      return {
        count,
        rows,
      };
    } catch (err) {
      throw err;
    }
  };

  async getAll(args: IGetOptions): Promise<T[]> {
    try {
      let { query = {}, select = [], ...rest } = args;

      const _select = select as (keyof T)[];

      // For array values to be used as In operator
      // https://github.com/typeorm/typeorm/blob/master/docs/find-options.md
      for (let key in query) {
        if (isArray(query[key])) {
          query[key] = In(query[key]);
        }
      }

      const rows = await this.repo.find({
        where: query,
        ...(_select?.length && { select: _select }),
        ...rest,
      });

      return rows;
    } catch (err) {
      throw err;
    }
  }

  async getById(args: IEntityID): Promise<T | undefined> {
    try {
      const select = (args.select ?? []) as (keyof T)[];

      const row = await this.repo.findOne(args.id, {
        relations: args?.relations ?? [],
        ...(select?.length && { select }),
      });

      return row;
    } catch (err) {
      throw err;
    }
  }

  async getSingleEntity(args: ISingleEntityQuery): Promise<T | undefined> {
    try {
      const query = args.query;
      if (!query) {
        throw new ValidationError({
          details: ['Argument query is required'],
        });
      }
      const row = await this.repo.findOne({
        where: args.query,
        relations: args?.relations ?? [],
      });
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
          details: [strings.resourceNotFound],
        });
      }

      await this.repo.delete(args.id);
      return row;
    } catch (err) {
      throw err;
    }
  }

  countEntities = (args: IGetOptions): Promise<number> => {
    let { query = {}, select = [], ...rest } = args;

    // For array values to be used as In operator
    // https://github.com/typeorm/typeorm/blob/master/docs/find-options.md
    for (let key in query) {
      if (isArray(query[key])) {
        query[key] = In(query[key]);
      }
    }

    return this.repo.count({
      where: query,
      ...rest,
    });
  };
}
