import Dataloader from 'dataloader';

import { TYPES } from '../../types';
import container from '../../inversify.config';
import Client from '../../entities/client.entity';
import UserClient from '../../entities/user-client.entity';
import { UserClientStatus } from '../../config/constants';

import { IClientRepository } from '../../interfaces/client.interface';
import { IUserClientRepository } from '../../interfaces/user-client.interface';

const batchByIdFn = async (ids: readonly string[]) => {
  const clientRepo: IClientRepository = container.get(TYPES.ClientRepository);
  const query = { id: ids };
  const clients = await clientRepo.getAll({ query });
  const clientObj: { [id: string]: Client } = {};

  clients.forEach((client: Client) => {
    clientObj[client.id] = client;
  });

  return ids.map((id) => clientObj[id]);
};

const batchActiveClientByUserIdFn = async (user_ids: readonly string[]) => {
  const userClientRepo: IUserClientRepository = container.get(TYPES.UserClientRepository);

  const query = { user_id: user_ids, status: UserClientStatus.Active };
  const userClients = await userClientRepo.getAll({ query, relations: ['client'] });
  const userClientObj: { [user_id: string]: Client } = {};

  userClients.forEach((userClient: UserClient) => {
    userClientObj[userClient.user_id] = userClient.client;
  });

  return user_ids.map((id) => userClientObj[id]);
};

export const clientByIdLoader = () => new Dataloader(batchByIdFn);
export const activeClientByUserIdLoader = () => new Dataloader(batchActiveClientByUserIdFn);
