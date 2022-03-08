import { ContainerModule, interfaces } from 'inversify';

import { TYPES } from '../../types';

// interface

// Resolvers
import RoleRepository from '../../repository/role.repository';
import RoleService from '../../services/role.service';
import { RoleResolver } from '../../graphql/resolvers/role.resolver';
import { IRoleRepository, IRoleService } from '../../interfaces/role.interface';

const role = new ContainerModule((bind: interfaces.Bind, unbind: interfaces.Unbind) => {
  bind<IRoleRepository>(TYPES.RoleRepository).to(RoleRepository);
  bind<IRoleService>(TYPES.RoleService).to(RoleService);
  bind<RoleResolver>(RoleResolver).to(RoleResolver).inSingletonScope();
});

export default role;
