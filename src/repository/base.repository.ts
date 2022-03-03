import { Repository } from 'typeorm';

import { IPagingArgs, IGetAllAndCountResult } from '../interfaces/paging.interface';
import {} from '../utils/api-error';

export default class BaseRepository<T> {
  protected repo: Repository<T>;

  constructor(repo: Repository<T>) {
    this.repo = repo;
  }

  getAllAndCount = (args: IPagingArgs): Promise<IGetAllAndCountResult<T>> => {
    throw new Error('not implemented');
    //try {
    //return Promise.resolve({
    //count: 1,
    //rows: [],
    //})
    //} catch(err) {
    //throw err;
    //}
  };
}
