import { injectable } from 'inversify';
import { getRepository } from 'typeorm';
import TaskAssignment from '../entities/task-assignment.entity';
import { ITaskAssignmentCreate, ITaskAssignmentRepository, ITaskQuery } from '../interfaces/task-assignment.interface';
import BaseRepository from './base.repository';
import TaskRepository from './task.repository';

@injectable()
export default class TaskAssignmentRepository
  extends BaseRepository<TaskAssignment>
  implements ITaskAssignmentRepository
{
  constructor() {
    super(getRepository(TaskAssignment));
  }

  create(args: ITaskAssignmentCreate): Promise<TaskAssignment> {
    try {
      const employee_id = args.employee_id;
      const task_id = args.task_id;

      const taskAssignment = this.repo.save({
        employee_id,
        task_id,
      });
      return taskAssignment;
    } catch (err) {
      throw err;
    }
  }

  getByTaskId = async (args: ITaskQuery): Promise<TaskAssignment> => {
    try {
      const taskAssignment: any = await this.repo.findOne({
        where: {
          task_id: args.task_id,
        },
      });

      return taskAssignment;
    } catch (err) {
      throw err;
    }
  };
}
