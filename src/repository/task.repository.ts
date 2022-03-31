import { inject, injectable } from 'inversify';
import { merge } from 'lodash';
import { getRepository } from 'typeorm';
import strings from '../config/strings';
import Task from '../entities/task.entity';
import { IEntityID } from '../interfaces/common.interface';
import { IAssignTask, ITaskCreateInput, ITaskRepository, ITaskUpdateInput } from '../interfaces/task.interface';
import { IUserRepository } from '../interfaces/user.interface';
import { TYPES } from '../types';
import { NotFoundError, ValidationError } from '../utils/api-error';
import BaseRepository from './base.repository';

@injectable()
export default class TaskRepository extends BaseRepository<Task> implements ITaskRepository {
  private userRepository: IUserRepository;
  constructor(@inject(TYPES.UserRepository) userRepository: IUserRepository) {
    super(getRepository(Task));
    this.userRepository = userRepository;
  }

  create(args: ITaskCreateInput): Promise<Task> {
    try {
      const name = args.name;
      const status = args.status;
      const isArchived = args.isArchived;
      const manager_id = args.manager_id;
      const company_id = args.company_id;

      const task = this.repo.save({
        name,
        status,
        isArchived,
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
      const isArchived = args.isArchived;
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
        isArchived,
        manager_id,
        company_id,
      });
      let task = await this.repo.save(update);

      return task;
    } catch (err) {
      throw err;
    }
  };

  async assignTask(args: IAssignTask): Promise<Task> {
    try {
      const employee_id = args.employee_id;
      const id = args.task_id;

      const found = await this.getById({ id });
      if (!found) {
        throw new NotFoundError({
          details: [strings.taskNotFound],
        });
      }

      const existingUsers = await this.userRepository.getAll({
        query: {
          id: employee_id,
        },
      });

      if (existingUsers?.length !== employee_id.length) {
        throw new ValidationError({
          details: [strings.userNotFound],
        });
      }
      const update = merge(found, {
        id,
        users: existingUsers,
      });

      let task = await this.repo.save(update);
      return task;
    } catch (err) {
      throw err;
    }
  }
  async getAssignedTaskById(args: IEntityID): Promise<Task> {
    try {
      const id = args.id;

      const task: any = await this.repo.findOne(id, {
        relations: ['users'],
      });
      return task;
    } catch (err) {
      throw err;
    }
  }
}
