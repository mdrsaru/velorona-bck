import { ContainerModule, interfaces } from 'inversify';

import { TYPES } from '../../types';

// interface
import { IProjectRepository, IProjectService } from '../../interfaces/project.interface';

// Project
import ProjectRepository from '../../repository/project.repository';
import ProjectService from '../../services/project.service';

// Resolvers
import { ProjectResolver } from '../../graphql/resolvers/project.resolver';

const project = new ContainerModule((bind: interfaces.Bind, unbind: interfaces.Unbind) => {
  bind<IProjectRepository>(TYPES.ProjectRepository).to(ProjectRepository);
  bind<IProjectService>(TYPES.ProjectService).to(ProjectService);
  bind<ProjectResolver>(ProjectResolver).to(ProjectResolver).inSingletonScope();
});

export default project;
