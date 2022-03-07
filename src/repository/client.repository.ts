import merge from 'lodash/merge';
import { injectable, inject } from 'inversify';
import { getRepository, Repository } from 'typeorm';

import { TYPES } from '../types';
import Client from '../entities/client.entity';
import BaseRepository from './base.repository';
import { IClient, IClientCreate, IClientUpdate, IClientRepository } from '../interfaces/client.interface';
import { IPagingArgs, IGetAllAndCountResult } from '../interfaces/paging.interface';
import { IEntityRemove, IEntityID } from '../interfaces/common.interface';
import { NotFoundError } from '../utils/api-error';

@injectable()
export default class ClientRepository extends BaseRepository<Client> implements IClientRepository {
  constructor() {
    super(getRepository(Client));
  }

  create = async (args: IClientCreate): Promise<Client> => {
    try {
      const name = args.name;
      const status = args.status;

      const client = await this.repo.save({
        name,
        status,
      });

      return client;
    } catch (err) {
      throw err;
    }
  };

  update = async (args: IClientUpdate): Promise<Client> => {
    try {
      const id = args.id;
      const name = args.name;
      const status = args.status;

      const found = await this.getById({ id });

      if (!found) {
        throw new NotFoundError({
          details: ['Client not found'],
        });
      }

      const update = merge(found, {
        id,
        name,
        status,
      });

      const client = await this.repo.save(update);

      return client;
    } catch (err) {
      throw err;
    }
  };
}
