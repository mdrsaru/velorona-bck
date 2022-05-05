import { inject, injectable } from 'inversify';
import { getManager, EntityManager, getRepository } from 'typeorm';

import { TYPES } from '../types';
import * as apiError from '../utils/api-error';
import { taskAssignmentTable } from '../config/db/columns';
import { entities } from '../config/constants';

import { ITaskAssignmentRepository, ITaskAssignmentUserQuery, ITaskAssignment } from '../interfaces/task.interface';

@injectable()
export default class TaskAssignmentRepository implements ITaskAssignmentRepository {
  private manager: EntityManager;

  constructor() {
    this.manager = getManager();
  }

  getTaskAssignmentByUser = async (args: ITaskAssignmentUserQuery): Promise<ITaskAssignment[]> => {
    const user_id = args.user_id;

    try {
      const taskAssignment = await this.manager.query(
        `SELECT ${taskAssignmentTable.user_id}, ${taskAssignmentTable.task_id}  from ${entities.taskAssignment} where user_id = $1`,
        [user_id]
      );

      return taskAssignment;
    } catch (err) {
      throw err;
    }
  };
}
