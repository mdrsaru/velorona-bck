import { inject, injectable } from 'inversify';
import { merge } from 'lodash';
import { getRepository, getManager } from 'typeorm';
import strings from '../config/strings';
import Task from '../entities/task.entity';
import User from '../entities/user.entity';
import { IEntityID } from '../interfaces/common.interface';
import { ICompanyRepository } from '../interfaces/company.interface';
import { IMediaRepository } from '../interfaces/media.interface';
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
  private mediaRepository: IMediaRepository;

  constructor(
    @inject(TYPES.UserRepository) userRepository: IUserRepository,
    @inject(TYPES.CompanyRepository) _companyRepository: ICompanyRepository,
    @inject(TYPES.ProjectRepository) _projectRepository: IProjectRepository,
    @inject(TYPES.MediaRepository) _mediaRepository: IMediaRepository
  ) {
    super(getRepository(Task));
    this.userRepository = userRepository;
    this.companyRepository = _companyRepository;
    this.projectRepository = _projectRepository;
    this.mediaRepository = _mediaRepository;
  }

  async create(args: ITaskCreateInput): Promise<Task> {
    try {
      const name = args.name?.trim();
      const status = args.status;
      const description = args.description;
      const active = args.active;
      const archived = args.archived;
      const manager_id = args.manager_id;
      const company_id = args.company_id;
      const project_id = args.project_id;
      const user_ids = args.user_ids;
      const attachment_ids = args.attachment_ids;

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

      const existingMedia = await this.mediaRepository.getAll({
        query: {
          id: attachment_ids,
        },
      });
      const task = await this.repo.save({
        name,
        description,
        active,
        status,
        archived,
        manager_id,
        company_id,
        project_id,
        attachments: existingMedia,
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
      const description = args?.description;
      const archived = args.archived;
      const active = args.active;
      const manager_id = args.manager_id;
      const project_id = args.project_id;

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
        archived,
        manager_id,
        project_id,
        active,
        description,
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
