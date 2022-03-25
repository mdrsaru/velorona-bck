import { ContainerModule, interfaces } from 'inversify';

import { TYPES } from '../../types';

// interface
import {
  IClientRepository,
  IClientService,
} from '../../interfaces/client.interface';

// Client
import ClientRepository from '../../repository/client.repository';
import ClientService from '../../services/client.service';

// Resolvers
import { ClientResolver } from '../../graphql/resolvers/client.resolver';

const client = new ContainerModule(
  (bind: interfaces.Bind, unbind: interfaces.Unbind) => {
    bind<IClientRepository>(TYPES.ClientRepository).to(ClientRepository);
    bind<IClientService>(TYPES.ClientService).to(ClientService);
    bind<ClientResolver>(ClientResolver).to(ClientResolver).inSingletonScope();
  }
);

export default client;
