import Dataloader from 'dataloader';

import { TYPES } from '../../types';
import container from '../../inversify.config';
import { ITaskRepository } from '../../interfaces/task.interface';

const batchTasksByIdFn = async (ids: readonly string[]) => {
  const TaskRepo: ITaskRepository = container.get(TYPES.TaskRepository);
  const query = { id: ids };
  const tasks = await TaskRepo.getAll({ query });
  const taskObj: any = {};

  tasks.forEach((task: any) => {
    taskObj[task.id] = task;
  });

  return ids.map((id) => taskObj[id]);
};

export const tasksByIdLoader = () => new Dataloader(batchTasksByIdFn);
