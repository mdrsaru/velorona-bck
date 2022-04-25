import Dataloader from 'dataloader';

import { TYPES } from '../../types';
import container from '../../inversify.config';
import { IProjectRepository } from '../../interfaces/project.interface';
import { ITaskRepository } from '../../interfaces/task.interface';

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

const batchTasksByProjectIdFn = async (ids: readonly string[]) => {
  const TaskRepo: ITaskRepository = container.get(TYPES.TaskRepository);
  const query = { project_id: ids };

  const tasks = await TaskRepo.getAll({ query });
  const taskObj: any = {};

  tasks.forEach((task: any) => {
    taskObj[task.project_id] = task;
  });

  return ids.map((id) => taskObj[id]);
};

export const projectsByIdLoader = () => new Dataloader(batchProjectsByIdFn);
export const tasksByProjectIdLoader = () => new Dataloader(batchTasksByProjectIdFn);
