import { ContainerModule, interfaces } from 'inversify';

import { TYPES } from '../../types';

// interface
import { IUserService, IUserRepository } from '../../interfaces/user.interface';

// C ient
import UserRepository from '../../repository/user.repository';
import UserService from '../../services/user.service';

// Resolvers
import { UserResolver } from '../../graphql/resolvers/user.resolver';

const user = new ContainerModule(
  (bind: interfaces.Bind, unbind: interfaces.Unbind) => {
    bind<IUserRepository>(TYPES.UserRepository).to(UserRepository);
    bind<IUserService>(TYPES.UserService).to(UserService);
    bind<UserResolver>(UserResolver).to(UserResolver).inSingletonScope();
  }
);

export default user;
