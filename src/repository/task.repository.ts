import { inject, injectable } from 'inversify';
import { merge } from 'lodash';
import { getRepository, getManager } from 'typeorm';
import strings from '../config/strings';
import Task from '../entities/task.entity';
import { IEntityID } from '../interfaces/common.interface';
import { ICompanyRepository } from '../interfaces/company.interface';
import { IProjectRepository } from '../interfaces/project.interface';
import { IAssignTask, ITaskCreateInput, ITaskRepository, ITaskUpdateInput } from '../interfaces/task.interface';
import { IUserRepository } from '../interfaces/user.interface';
import { TYPES } from '../types';
import { NotFoundError, ValidationError } from '../utils/api-error';
import BaseRepository from './base.repository';

@injectable()
export default class TaskRepository extends BaseRepository<Task> implements ITaskRepository {
  private userRepository: IUserRepository;
  private companyRepository: ICompanyRepository;
  private projectRepository: IProjectRepository;
  constructor(
    @inject(TYPES.UserRepository) userRepository: IUserRepository,
    @inject(TYPES.CompanyRepository) _companyRepository: ICompanyRepository,
    @inject(TYPES.ProjectRepository) _projectRepository: IProjectRepository
  ) {
    super(getRepository(Task));
    this.userRepository = userRepository;
    this.companyRepository = _companyRepository;
    this.projectRepository = _projectRepository;
  }

  async create(args: ITaskCreateInput): Promise<Task> {
    try {
      const name = args.name?.trim();
      const status = args.status;
      const archived = args.archived;
      const manager_id = args.manager_id;
      const company_id = args.company_id;
      const project_id = args.project_id;
      const user_ids = args.user_ids;

      const project = await this.projectRepository.getById({ id: project_id });

      if (!project) {
        throw new NotFoundError({
          details: [strings.projectNotFound],
        });
      }

      const company = await this.companyRepository.getById({ id: company_id });
      if (!company) {
        throw new NotFoundError({
          details: [strings.companyNotFound],
        });
      }

      const manager = await this.userRepository.getById({ id: manager_id });
      if (!manager) {
        throw new NotFoundError({
          details: [strings.userNotFound],
        });
      }

      const task = await this.repo.save({
        name,
        status,
        archived,
        manager_id,
        company_id,
        project_id,
      });

      if (user_ids) {
        const arg = {
          user_id: user_ids,
          task_id: task.id,
        };
        await this.assignTask(arg);
      }

      return task;
    } catch (err) {
      throw err;
    }
  }

  update = async (args: ITaskUpdateInput): Promise<Task> => {
    try {
      const id = args?.id;
      const name = args.name?.trim();
      const status = args.status;
      const archived = args.archived;
      const manager_id = args.manager_id;
      const company_id = args.company_id;
      const project_id = args.project_id;
      const user_ids = args.user_ids;

      const found = await this.getById({ id });

      if (!found) {
        throw new NotFoundError({
          details: ['Task not found'],
        });
      }

      if (user_ids) {
        const arg = {
          user_id: user_ids,
          task_id: id,
        };
        await this.assignTask(arg);
      }

      const update = merge(found, {
        id,
        name,
        status,
        archived,
        manager_id,
        company_id,
        project_id,
      });

      let task = await this.repo.save(update);

      return task;
    } catch (err) {
      throw err;
    }
  };

  async assignTask(args: IAssignTask): Promise<Task> {
    try {
      const user_id = args.user_id;
      const id = args.task_id;

      const found = await this.getById({ id });
      if (!found) {
        throw new NotFoundError({
          details: [strings.taskNotFound],
        });
      }

      const existingUsers = await this.userRepository.getAll({
        query: {
          id: user_id,
        },
      });

      if (existingUsers?.length !== user_id.length) {
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
}
