import merge from 'lodash/merge';
import { injectable, inject } from 'inversify';
import { getRepository, Repository } from 'typeorm';
import crypto from 'crypto';

import { TYPES } from '../types';
import strings from '../config/strings';
import Client from '../entities/client.entity';
import BaseRepository from './base.repository';
import { ConflictError, NotFoundError } from '../utils/api-error';

import {
  IClient,
  IClientCreate,
  IClientUpdate,
  IClientRepository,
  IClientCodeInput,
} from '../interfaces/client.interface';

@injectable()
export default class ClientRepository
  extends BaseRepository<Client>
  implements IClientRepository
{
  constructor() {
    super(getRepository(Client));
  }

  create = async (args: IClientCreate): Promise<Client> => {
    try {
      const name = args.name?.trim();
      const status = args.status;

      let clientName = name.substr(0, 5)?.toLowerCase();
      const length = 10 - clientName.length;
      const randomNumber = crypto
        .randomBytes(length)
        .toString('hex')
        .slice(0, length);

      const clientCode: string = clientName + randomNumber;
      const found = await this.repo.find({ clientCode });

      if (found.length) {
        throw new ConflictError({ details: [strings.clientCodeExists] });
      }

      const client = await this.repo.save({
        name,
        status,
        clientCode,
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

  getByClientCode = async (
    args: IClientCodeInput
  ): Promise<Client | undefined> => {
    try {
      const clientCode = args.clientCode;
      const client = await this.repo.findOne({ clientCode: clientCode });
      return client;
    } catch (err) {
      throw err;
    }
  };
}
