import { inject, injectable } from 'inversify';
import { isArray, merge } from 'lodash';
import { getRepository, getManager, In, SelectQueryBuilder, ILike, NotBrackets, Brackets } from 'typeorm';

import strings from '../config/strings';
import Task from '../entities/task.entity';
import User from '../entities/user.entity';
import Media from '../entities/media.entity';
import { IEntityID } from '../interfaces/common.interface';
import { TYPES } from '../types';
import { NotFoundError, ValidationError } from '../utils/api-error';
import BaseRepository from './base.repository';

import { ICompanyRepository } from '../interfaces/company.interface';
import { IMediaRepository } from '../interfaces/media.interface';
import { IProjectRepository } from '../interfaces/project.interface';
import {
  IAssignTask,
  ITaskAssignmentRepository,
  ITaskCreateInput,
  ITaskRepository,
  ITaskUpdateInput,
} from '../interfaces/task.interface';
import { IUserRepository } from '../interfaces/user.interface';
import { IGetAllAndCountResult, IGetOptions } from '../interfaces/paging.interface';
import TaskAssignmentRepository from './task-assignment.repository';

@injectable()
export default class TaskRepository extends BaseRepository<Task> implements ITaskRepository {
  private userRepository: IUserRepository;
  private companyRepository: ICompanyRepository;
  private projectRepository: IProjectRepository;
  private mediaRepository: IMediaRepository;
  private taskAssignmentRepository: ITaskAssignmentRepository;

  constructor(
    @inject(TYPES.UserRepository) userRepository: IUserRepository,
    @inject(TYPES.CompanyRepository) _companyRepository: ICompanyRepository,
    @inject(TYPES.ProjectRepository) _projectRepository: IProjectRepository,
    @inject(TYPES.MediaRepository) _mediaRepository: IMediaRepository,
    @inject(TYPES.TaskAssignmentRepository) _taskAssignmentRepository: ITaskAssignmentRepository
  ) {
    super(getRepository(Task));
    this.userRepository = userRepository;
    this.companyRepository = _companyRepository;
    this.projectRepository = _projectRepository;
    this.mediaRepository = _mediaRepository;
    this.taskAssignmentRepository = _taskAssignmentRepository;
  }

  getAllAndCount = async (args: IGetOptions): Promise<IGetAllAndCountResult<Task>> => {
    try {
      let { query = {}, select = [], relations = [], ...rest } = args;

      const _select = select as (keyof Task)[];

      // For array values to be used as In operator
      // https://github.com/typeorm/typeorm/blob/master/docs/find-options.md
      for (let key in query) {
        if (isArray(query[key])) {
          query[key] = In(query[key]);
        }
      }

      if (query.user_id || query.created_by) {
        relations.push('users');
      }

      const _where = (qb: SelectQueryBuilder<User>) => {
        if (query.created_by && query.user_id) {
          let { created_by, user_id, ...where } = query;
          qb.where(where).andWhere(
            new Brackets((qb) => {
              qb.where('created_by=:created_by', {
                created_by: created_by ?? '',
              }).orWhere('user_id=:user_id', { user_id: user_id });
            })
          );
        } else if (query.user_id) {
          let { created_by, user_id, ...where } = query;
          qb.where(where).andWhere('user_id=:user_id', { user_id: user_id });
        } else {
          qb.where(query);
        }
      };

      const [rows, count] = await this.repo.findAndCount({
        relations,
        where: _where,
        ...(_select?.length && { select: _select }),
        ...rest,
      });
      return {
        count,
        rows,
      };
    } catch (err) {
      throw err;
    }
  };

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
      const created_by = args.created_by;
      const user_ids = args.user_ids;
      const attachment_ids = args.attachment_ids;
      const deadline = args.deadline;

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

      if (manager_id) {
        const manager = await this.userRepository.getById({ id: manager_id });
        if (!manager) {
          throw new NotFoundError({
            details: [strings.userNotFound],
          });
        }
      }
      const creator = await this.userRepository.getById({ id: created_by });
      if (!creator) {
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
        created_by,
        attachments: existingMedia,
        deadline,
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
      const priority = args.priority;
      const deadline = args.deadline;
      const attachment_ids = args.attachment_ids;

      const found = await this.getById({ id });

      if (!found) {
        throw new NotFoundError({
          details: ['Task not found'],
        });
      }

      const existingMedia = await this.mediaRepository.getAll({
        query: {
          id: attachment_ids,
        },
      });
      const update = merge(found, {
        id,
        name,
        status,
        archived,
        manager_id,
        project_id,
        active,
        description,
        priority,
        deadline,
        attachments: existingMedia,
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
