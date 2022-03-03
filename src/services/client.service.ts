import { injectable, inject } from 'inversify';

import { IClient, IClientCreate, IClientUpdate, IClientRepository } from '../interfaces/client.interface';
import { TYPES } from '../types';
import { IPagingArgs, IGetAllAndCountResult } from '../interfaces/paging.interface';
import { IEntityRemove } from '../interfaces/common.interface';

@injectable()
export default class ClientService {
  private clientRepository: IClientRepository;
  constructor(@inject(TYPES.ClientRepository) clientRepository: IClientRepository) {
    this.clientRepository = clientRepository;
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
