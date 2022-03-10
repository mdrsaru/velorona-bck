import { injectable, inject } from 'inversify';

import Dataloader from 'dataloader';

import { TYPES } from '../../types';
import container from '../../inversify.config';
import { IClientRepository } from '../../interfaces/client.interface';

const batchClientByIdFn = async (ids: readonly string[]) => {
  const clientRepo: IClientRepository = container.get(TYPES.ClientRepository);
  const query = { id: ids };
  const clients = await clientRepo.getAll({ query });

  const clientObj: any = {};

  clients.forEach((client: any) => {
    clientObj[client.id] = client;
  });

  return ids.map((id) => clientObj[id]);
};

export const clientByIdLoader = () => new Dataloader(batchClientByIdFn);
