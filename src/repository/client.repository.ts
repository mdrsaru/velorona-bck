import { injectable, inject } from 'inversify';
import { getRepository, Repository } from 'typeorm';

import { TYPES } from '../types';
import Client from '../entities/client.entity';
import { IClient, IClientCreate, IClientUpdate, IClientRepository } from '../interfaces/client.interface';
import { IPagingArgs, IGetAllAndCountResult } from '../interfaces/paging.interface';
import { IEntityRemove } from '../interfaces/common.interface';

@injectable()
export default class ClientRepository implements IClientRepository {
  private repo: Repository<Client>;

  constructor() {
    this.repo = getRepository(Client);
  }

  getAllAndCount = (args: IPagingArgs) => {
    throw new Error('not implemented');
  };

  create = (args: IClientCreate) => {
    throw new Error('not implemented');
  };

  update = (args: IClientUpdate) => {
    throw new Error('not implemented');
  };

  remove = (args: IEntityRemove) => {
    throw new Error('not implemented');
  };
}
