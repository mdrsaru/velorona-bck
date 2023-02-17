import { ContainerModule, interfaces } from 'inversify';
import { UserProjectResolver } from '../../graphql/resolvers/user-project.resolver';
import { IUserProjectRepository, IUserProjectService } from '../../interfaces/user-project.interface';
import UserProjectRepository from '../../repository/users-projects.repository';
import UserProjectService from '../../services/user-project.service';
import { TYPES } from '../../types';

const userProject = new ContainerModule((bind: interfaces.Bind, unbind: interfaces.Unbind) => {
  bind<IUserProjectRepository>(TYPES.UserProjectRepository).to(UserProjectRepository);
  bind<IUserProjectService>(TYPES.UserProjectService).to(UserProjectService);
  bind<UserProjectResolver>(UserProjectResolver).to(UserProjectResolver).inSingletonScope();
});

export default userProject;
