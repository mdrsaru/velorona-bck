import Dataloader from 'dataloader';

import { TYPES } from '../../types';
import container from '../../inversify.config';
import { IClientRepository } from '../../interfaces/client.interface';

const batchClientsByIdFn = async (ids: readonly string[]) => {
  const ClientRepo: IClientRepository = container.get(TYPES.ClientRepository);
  const query = { id: ids };
  const clients = await ClientRepo.getAll({ query });
  const clientObj: any = {};

  clients.forEach((client: any) => {
    clientObj[client.id] = client;
  });

  return ids.map((id) => clientObj[id]);
};

export const clientsByIdLoader = () => new Dataloader(batchClientsByIdFn);
