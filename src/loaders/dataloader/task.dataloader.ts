import Dataloader from 'dataloader';
import { ITaskRepository } from '../../interfaces/task.interface';
import container from '../../inversify.config';
import { TYPES } from '../../types';

const batchUsersByTaskIdFn = async (ids: readonly string[]) => {
  const taskRepository: ITaskRepository = container.get(TYPES.TaskRepository);
  const taskObj: any = {};
  let query = { id: ids };
  const tasks = await taskRepository.getAll({ query, relations: ['users'] });
  tasks.forEach((task: any) => {
    taskObj[task.id] = task.users;
  });

  return ids.map((id) => taskObj[id]);
};

export const usersByTaskIdLoader = () => new Dataloader(batchUsersByTaskIdFn);
