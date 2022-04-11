import { ContainerModule, interfaces } from 'inversify';

import { IUserClientRepository } from '../../interfaces/user-client.interface';
import UserClientRepository from '../../repository/user-clients.repository';
import { TYPES } from '../../types';

const userClient = new ContainerModule((bind: interfaces.Bind, unbind: interfaces.Unbind) => {
  bind<IUserClientRepository>(TYPES.UserClientRepository).to(UserClientRepository);
});

export default userClient;
