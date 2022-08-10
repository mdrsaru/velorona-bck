import Dataloader from 'dataloader';

import { TYPES } from '../../types';
import container from '../../inversify.config';
import { IProjectRepository } from '../../interfaces/project.interface';
import Project from '../../entities/project.entity';

const batchProjectsByIdFn = async (ids: readonly string[]) => {
  const projectRepo: IProjectRepository = container.get(TYPES.ProjectRepository);
  const query = { id: ids };
  const projects = await projectRepo.getAll({ query });
  const projectObj: { [id: string]: Project } = {};

  projects.forEach((project: any) => {
    projectObj[project.id] = project;
  });

  return ids.map((id) => projectObj[id]);
};

const batchUsersByProjectIdFn = async (ids: readonly string[]) => {
  const projectRepository: IProjectRepository = container.get(TYPES.ProjectRepository);
  console.log(ids, 'saru');
  const projectObj: any = {};
  let query = { id: ids };
  const projects = await projectRepository.getAll({ query, relations: ['users'] });
  projects.forEach((project: any) => {
    projectObj[project.id] = project.users;
  });
  return ids.map((id) => projectObj[id]);
};

export const projectsByIdLoader = () => new Dataloader(batchProjectsByIdFn);
export const usersByProjectIdLoader = () => new Dataloader(batchUsersByProjectIdFn);
