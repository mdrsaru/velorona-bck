import { injectable } from 'inversify';
import { merge } from 'lodash';
import { getRepository } from 'typeorm';
import Task from '../entities/task.entity';
import { ITaskCreateInput, ITaskRepository, ITaskUpdateInput } from '../interfaces/task.interface';
import { NotFoundError } from '../utils/api-error';
import BaseRepository from './base.repository';

@injectable()
export default class TaskRepository extends BaseRepository<Task> implements ITaskRepository {
  constructor() {
    super(getRepository(Task));
  }

  create(args: ITaskCreateInput): Promise<Task> {
    try {
      const name = args.name;
      const status = args.status;
      const is_archived = args.is_archived;
      const manager_id = args.manager_id;
      const company_id = args.company_id;

      const task = this.repo.save({
        name,
        status,
        is_archived,
        manager_id,
        company_id,
      });
      return task;
    } catch (err) {
      throw err;
    }
  }

  update = async (args: ITaskUpdateInput): Promise<Task> => {
    try {
      const id = args?.id;
      const name = args.name;
      const status = args.status;
      const is_archived = args.is_archived;
      const manager_id = args.manager_id;
      const company_id = args.company_id;

      const found = await this.getById({ id });
      if (!found) {
        throw new NotFoundError({
          details: ['Task not found'],
        });
      }
      const update = merge(found, {
        id,
        name,
        status,
        is_archived,
        manager_id,
        company_id,
      });
      let task = await this.repo.save(update);

      return task;
    } catch (err) {
      throw err;
    }
  };
}
