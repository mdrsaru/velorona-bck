import { ContainerModule, interfaces } from 'inversify';
import { TaskResolver } from '../../graphql/resolvers/task.resolver';
import { ITaskRepository, ITaskService } from '../../interfaces/task.interface';
import TaskRepository from '../../repository/task.repository';
import TaskService from '../../services/task.service';

import { TYPES } from '../../types';

const task = new ContainerModule(
  (bind: interfaces.Bind, unbind: interfaces.Unbind) => {
    bind<ITaskRepository>(TYPES.TaskRepository).to(TaskRepository);
    bind<ITaskService>(TYPES.TaskService).to(TaskService);
    bind<TaskResolver>(TaskResolver).to(TaskResolver).inSingletonScope();
  }
);

export default task;
