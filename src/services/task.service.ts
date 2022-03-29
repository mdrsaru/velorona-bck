import { inject, injectable } from 'inversify';
import strings from '../config/strings';
import Task from '../entities/task.entity';
import { IEntityRemove, IErrorService, ILogger } from '../interfaces/common.interface';
import { IPaginationData, IPagingArgs } from '../interfaces/paging.interface';
import { ITaskAssignmentRepository } from '../interfaces/task-assignment.interface';
import { ITaskCreateInput, ITaskRepository, ITaskService, ITaskUpdateInput } from '../interfaces/task.interface';
import { TYPES } from '../types';
import { ForbiddenError } from '../utils/api-error';
import Paging from '../utils/paging';

@injectable()
export default class TaskService implements ITaskService {
  private name = 'TaskService';
  private taskRepository: ITaskRepository;
  private logger: ILogger;
  private errorService: IErrorService;
  private taskAssigmentRepository: ITaskAssignmentRepository;

  constructor(
    @inject(TYPES.TaskRepository) taskRepository: ITaskRepository,
    @inject(TYPES.LoggerFactory) loggerFactory: (name: string) => ILogger,
    @inject(TYPES.ErrorService) errorService: IErrorService,
    @inject(TYPES.TaskAssignmentRepository)
    taskAssignmentRepository: ITaskAssignmentRepository
  ) {
    this.taskRepository = taskRepository;
    this.logger = loggerFactory(this.name);
    this.taskAssigmentRepository = taskAssignmentRepository;
  }

  getAllAndCount = async (args: IPagingArgs): Promise<IPaginationData<Task>> => {
    try {
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
    const is_archived = args.is_archived;
    const manager_id = args.manager_id;
    const company_id = args.company_id;

    try {
      let task = await this.taskRepository.create({
        name,
        status,
        is_archived,
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
    const is_archived = args?.is_archived;
    const manager_id = args?.manager_id;
    const company_id = args?.company_id;

    const taskAssignment = await this.taskAssigmentRepository.getByTaskId({ task_id: id });

    if (taskAssignment.employee_id !== null) {
      throw new ForbiddenError({ details: [strings.taskNotFound] });
    }
    try {
      let task = await this.taskRepository.update({
        id,
        name,
        status,
        is_archived,
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
}
