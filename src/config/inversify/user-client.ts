import { ContainerModule, interfaces } from 'inversify';
import { UserClientResolver } from '../../graphql/resolvers/user-client.resolver';

import { IUserClientRepository, IUserClientService } from '../../interfaces/user-client.interface';
import UserClientRepository from '../../repository/user-clients.repository';
import UserClientService from '../../services/user-client.service';
import { TYPES } from '../../types';

const userClient = new ContainerModule((bind: interfaces.Bind, unbind: interfaces.Unbind) => {
  bind<IUserClientRepository>(TYPES.UserClientRepository).to(UserClientRepository);
  bind<IUserClientService>(TYPES.UserClientService).to(UserClientService);
  bind<UserClientResolver>(UserClientResolver).to(UserClientResolver).inSingletonScope();
});

export default userClient;
