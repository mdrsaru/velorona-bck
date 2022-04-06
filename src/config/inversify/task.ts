import { ContainerModule, interfaces } from 'inversify';

import { TaskResolver } from '../../graphql/resolvers/task.resolver';
import TaskRepository from '../../repository/task.repository';
import TaskService from '../../services/task.service';
import TaskAssignmentRepository from '../../repository/task-assignment.repository';

import { ITaskRepository, ITaskService, ITaskAssignmentRepository } from '../../interfaces/task.interface';

import { TYPES } from '../../types';

const task = new ContainerModule((bind: interfaces.Bind, unbind: interfaces.Unbind) => {
  bind<ITaskRepository>(TYPES.TaskRepository).to(TaskRepository);
  bind<ITaskService>(TYPES.TaskService).to(TaskService);
  bind<TaskResolver>(TaskResolver).to(TaskResolver).inSingletonScope();
  bind<ITaskAssignmentRepository>(TYPES.TaskAssignmentRepository).to(TaskAssignmentRepository);
});

export default task;
