import { inject, injectable } from 'inversify';
import strings from '../config/strings';
import Task from '../entities/task.entity';
import { IEntityID, IEntityRemove, IErrorService, ILogger } from '../interfaces/common.interface';
import { IPaginationData, IPagingArgs } from '../interfaces/paging.interface';
import {
  IAssignTask,
  ITaskCreateInput,
  ITaskRepository,
  ITaskService,
  ITaskUpdateInput,
} from '../interfaces/task.interface';
import { IUserRepository } from '../interfaces/user.interface';
import { TYPES } from '../types';
import { ForbiddenError } from '../utils/api-error';
import Paging from '../utils/paging';

@injectable()
export default class TaskService implements ITaskService {
  private name = 'TaskService';
  private taskRepository: ITaskRepository;
  private logger: ILogger;
  private errorService: IErrorService;

  constructor(
    @inject(TYPES.TaskRepository) taskRepository: ITaskRepository,
    @inject(TYPES.LoggerFactory) loggerFactory: (name: string) => ILogger,
    @inject(TYPES.ErrorService) errorService: IErrorService,
    @inject(TYPES.UserRepository) _userRepository: IUserRepository
  ) {
    this.taskRepository = taskRepository;
    this.logger = loggerFactory(this.name);
    this.errorService = errorService;
  }

  getAllAndCount = async (args: IPagingArgs): Promise<IPaginationData<Task>> => {
    try {
      args.query.isArchived = false;
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
    const isArchived = args.isArchived;
    const manager_id = args.manager_id;
    const company_id = args.company_id;

    try {
      let task = await this.taskRepository.create({
        name,
        status,
        isArchived,
        manager_id,
        company_id,
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
    const isArchived = args?.isArchived;
    const manager_id = args?.manager_id;
    const company_id = args?.company_id;

    try {
      if (status) {
        let task: Task | undefined = await this.taskRepository.getAssignedTaskById({ id: id });
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
        isArchived,
        manager_id,
        company_id,
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
      const employee_id = args.employee_id;
      const task_id = args.task_id;

      let res = await this.taskRepository.getById({ id: task_id });
      if (res?.isArchived) {
        throw new ForbiddenError({
          details: [strings.archievedTask],
        });
      }

      let task = await this.taskRepository.assignTask({
        employee_id,
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

  getAssignedTaskById = async (args: IEntityID) => {
    const operation = 'assign';
    try {
      const id = args.id;

      let task = await this.taskRepository.getAssignedTaskById({
        id: id,
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
}
