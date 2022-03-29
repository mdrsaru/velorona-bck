import { ContainerModule, interfaces } from 'inversify';

import { TYPES } from '../../types';

// interface

// Resolvers
import {
  ITaskAssignmentRepository,
  ITaskAssignmentService,
} from '../../interfaces/task-assignment.interface';
import TaskAssignmentRepository from '../../repository/task-assignment.repository';
import TaskAssignmentService from '../../services/task-assignment.service';
import { TaskAssignmentResolver } from '../../graphql/resolvers/task-assignment.resolver';

const taskAssignment = new ContainerModule(
  (bind: interfaces.Bind, unbind: interfaces.Unbind) => {
    bind<ITaskAssignmentRepository>(TYPES.TaskAssignmentRepository).to(
      TaskAssignmentRepository
    );
    bind<ITaskAssignmentService>(TYPES.TaskAssignmentService).to(
      TaskAssignmentService
    );
    bind<TaskAssignmentResolver>(TaskAssignmentResolver)
      .to(TaskAssignmentResolver)
      .inSingletonScope();
  }
);

export default taskAssignment;
