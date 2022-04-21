import Dataloader from 'dataloader';

import { TYPES } from '../../types';
import container from '../../inversify.config';
import { IProjectRepository } from '../../interfaces/project.interface';

const batchProjectsByIdFn = async (ids: readonly string[]) => {
  const ProjectRepo: IProjectRepository = container.get(TYPES.ProjectRepository);
  const query = { id: ids };
  const projects = await ProjectRepo.getAll({ query });
  const projectObj: any = {};

  projects.forEach((project: any) => {
    projectObj[project.id] = project;
  });

  return ids.map((id) => projectObj[id]);
};

export const projectsByIdLoader = () => new Dataloader(batchProjectsByIdFn);
