import { inject, injectable } from 'inversify';

import { TYPES } from '../types';
import strings from '../config/strings';
import Task from '../entities/task.entity';
import Paging from '../utils/paging';
import { ForbiddenError } from '../utils/api-error';

import { IEntityID, IEntityRemove, IErrorService, ILogger } from '../interfaces/common.interface';
import { IPaginationData, IPagingArgs } from '../interfaces/paging.interface';
import {
  IAssignTask,
  ITaskCreateInput,
  ITaskRepository,
  ITaskService,
  ITaskUpdateInput,
  ITaskAssignmentRepository,
} from '../interfaces/task.interface';
import { IUserRepository } from '../interfaces/user.interface';

@injectable()
export default class TaskService implements ITaskService {
  private name = 'TaskService';
  private taskRepository: ITaskRepository;
  private taskAssignmentRepository: ITaskAssignmentRepository;
  private logger: ILogger;
  private errorService: IErrorService;

  constructor(
    @inject(TYPES.TaskRepository) taskRepository: ITaskRepository,
    @inject(TYPES.LoggerFactory) loggerFactory: (name: string) => ILogger,
    @inject(TYPES.ErrorService) errorService: IErrorService,
    @inject(TYPES.UserRepository) _userRepository: IUserRepository,
    @inject(TYPES.TaskAssignmentRepository) _taskAssignmentRepository: ITaskAssignmentRepository
  ) {
    this.taskRepository = taskRepository;
    this.logger = loggerFactory(this.name);
    this.errorService = errorService;
    this.taskAssignmentRepository = _taskAssignmentRepository;
  }

  getAllAndCount = async (args: IPagingArgs): Promise<IPaginationData<Task>> => {
    try {
      if (args.query.user_id) {
        const user_id = args.query.user_id;
        delete args.query.user_id;

        const taskAssignmentByUser = await this.taskAssignmentRepository.getTaskAssignmentByUser({
          user_id,
        });

        args.query.id = taskAssignmentByUser.map((t) => t.task_id);
      }

      const { rows, count } = await this.taskRepository.getAllAndCount(args);

      const paging = Paging.getPagingResult({
        ...args,
        total: count,
      });

      return {
        paging,
        data: rows,
      };
    } catch (err) {
      throw err;
    }
  };

  create = async (args: ITaskCreateInput) => {
    const operation = 'create';
    const name = args.name;
    const status = args.status;
    const archived = args.archived;
    const manager_id = args.manager_id;
    const company_id = args.company_id;
    const project_id = args.project_id;
    const user_ids = args.user_ids;

    try {
      let task = await this.taskRepository.create({
        name,
        status,
        archived,
        manager_id,
        company_id,
        project_id,
        user_ids,
      });
      return task;
    } catch (err) {
      this.errorService.throwError({
        err,
        operation,
        name: this.name,
        logError: true,
      });
    }
  };

  update = async (args: ITaskUpdateInput) => {
    const operation = 'update';
    const id = args?.id;
    const name = args?.name;
    const status = args?.status;
    const archived = args?.archived;
    const manager_id = args?.manager_id;
    const project_id = args?.project_id;
    const user_ids = args.user_ids;

    try {
      if (user_ids) {
        await this.taskRepository.assignTask({
          user_id: user_ids,
          task_id: id,
        });
      }
      if (status) {
        let task: Task | undefined = await this.taskRepository.getById({ id, relations: ['users'] });
        if (task?.users.length) {
          throw new ForbiddenError({
            details: [strings.notAllowedToChangeStatus],
          });
        }
      }
      let task = await this.taskRepository.update({
        id,
        name,
        status,
        archived,
        manager_id,
        project_id,
        user_ids,
      });
      return task;
    } catch (err) {
      this.errorService.throwError({
        err,
        operation,
        name: this.name,
        logError: true,
      });
    }
  };
  remove = async (args: IEntityRemove) => {
    try {
      const id = args.id;
      const role = await this.taskRepository.remove({
        id,
      });
      return role;
    } catch (err) {
      throw err;
    }
  };

  assignTask = async (args: IAssignTask) => {
    const operation = 'assign';
    try {
      const user_id = args.user_id;
      const task_id = args.task_id;

      let res = await this.taskRepository.getById({ id: task_id });
      if (res?.archived) {
        throw new ForbiddenError({
          details: [strings.archievedTask],
        });
      }

      let task = await this.taskRepository.assignTask({
        user_id,
        task_id,
      });

      return task;
    } catch (err) {
      this.errorService.throwError({
        err,
        operation,
        name: this.name,
        logError: true,
      });
    }
  };

  getAssignedUserById = async (args: IEntityID) => {
    const operation = 'assign';
    try {
      const id = args.id;

      let task: any = await this.taskRepository.getById({
        id,
        relations: ['users'],
      });
      return task.users;
    } catch (err) {
      this.errorService.throwError({
        err,
        operation,
        name: this.name,
        logError: true,
      });
    }
  };
}
