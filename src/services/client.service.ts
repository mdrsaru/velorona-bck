import { injectable, inject } from 'inversify';

import { IClientCreate, IClientUpdate, IClientRepository, IClientService } from '../interfaces/client.interface';
import Client from '../entities/client.entity';
import Paging from '../utils/paging';
import { TYPES } from '../types';
import { IPagingArgs, IPaginationData } from '../interfaces/paging.interface';
import { IEntityRemove, IEntityID } from '../interfaces/common.interface';
@injectable()
export default class ClientService implements IClientService {
  private clientRepository: IClientRepository;
  constructor(@inject(TYPES.ClientRepository) clientRepository: IClientRepository) {
    this.clientRepository = clientRepository;
  }

  getAllAndCount = async (args: IPagingArgs): Promise<IPaginationData<Client>> => {
    try {
      const { rows, count } = await this.clientRepository.getAllAndCount(args);

      const paging = Paging.getPagingResult({
        ...args,
        total: count,
      });

      return {
        paging,
        data: rows,
      };
    } catch (err) {
      throw err;
    }
  };

  create = async (args: IClientCreate): Promise<Client> => {
    try {
      const name = args.name;
      const status = args.status;
      const client = await this.clientRepository.create({
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

      const client = await this.clientRepository.update({
        id,
        name,
        status,
      });

      return client;
    } catch (err) {
      throw err;
    }
  };

  remove = async (args: IEntityRemove): Promise<Client> => {
    try {
      const id = args.id;

      const client = await this.clientRepository.remove({
        id,
      });

      return client;
    } catch (err) {
      throw err;
    }
  };
}
