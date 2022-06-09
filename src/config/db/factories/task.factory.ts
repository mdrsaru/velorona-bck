import { define } from 'typeorm-seeding';

import { TaskStatus } from '../../constants';
import Task from '../../../entities/task.entity';

define(Task, () => {
  const task = new Task();

  task.active = true;
  task.archived = false;
  task.priority = false;
  task.status = TaskStatus.UnScheduled;

  return task;
});
