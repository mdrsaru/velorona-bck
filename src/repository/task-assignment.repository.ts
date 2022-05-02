import { inject, injectable } from 'inversify';
import { getManager, EntityManager, getRepository } from 'typeorm';

import { TYPES } from '../types';
import * as apiError from '../utils/api-error';
import { taskAssignmentTable } from '../config/db/columns';
import { entities } from '../config/constants';

import {
  ITaskAssignmentRepository,
  ITaskAssignmentUserQuery,
  ITaskAssignment,
  ITaskAssignmentRemoveInput,
} from '../interfaces/task.interface';
import { IEntityRemove } from '../interfaces/common.interface';
import { NotFoundError } from '../utils/api-error';
import strings from '../config/strings';
import BaseRepository from './base.repository';

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

  async remove(args: ITaskAssignmentRemoveInput): Promise<ITaskAssignment> {
    try {
      const user_id = args.removeAssignedUserId;
      const task_id = args.id;
      const sql = `SELECT * FROM  ${entities.taskAssignment}
      WHERE user_id ='${user_id}' AND task_id = '${task_id}'`;
      const row = await this.manager.query(sql);
      // if (row.length<=0) {
      //   throw new NotFoundError({
      //     details: [strings.resourceNotFound],
      //   });
      // }

      const res = await this.manager.query(
        `Delete from ${entities.taskAssignment} where task_id = '${task_id}' and user_id = '${user_id}'`
      );
      return row;
    } catch (err) {
      throw err;
    }
  }
}
