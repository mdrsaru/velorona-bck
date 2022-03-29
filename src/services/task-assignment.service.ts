import { inject, injectable } from 'inversify';
import strings from '../config/strings';
import { IErrorService, ILogger } from '../interfaces/common.interface';
import {
  ITaskAssignmentCreate,
  ITaskAssignmentRepository,
  ITaskAssignmentService,
} from '../interfaces/task-assignment.interface';
import {
  ITaskCreateInput,
  ITaskRepository,
} from '../interfaces/task.interface';
import { IUserRepository } from '../interfaces/user.interface';
import { TYPES } from '../types';
import { ForbiddenError, NotAuthenticatedError } from '../utils/api-error';

@injectable()
export default class TaskAssignmentService implements ITaskAssignmentService {
  private name = 'TaskAssignmentService';
  private taskAssigmentRepository: ITaskAssignmentRepository;
  private logger: ILogger;
  private errorService: IErrorService;
  private taskRepository: ITaskRepository;
  private userRepository: IUserRepository;

  constructor(
    @inject(TYPES.TaskAssignmentRepository)
    taskAssignmentRepository: ITaskAssignmentRepository,
    @inject(TYPES.TaskRepository) taskRepository: ITaskRepository,
    @inject(TYPES.LoggerFactory) loggerFactory: (name: string) => ILogger,
    @inject(TYPES.ErrorService) errorService: IErrorService,
    @inject(TYPES.UserRepository) _userRepository: IUserRepository
  ) {
    this.taskAssigmentRepository = taskAssignmentRepository;
    this.logger = loggerFactory(this.name);
    this.taskRepository = taskRepository;
    this.userRepository = _userRepository;
    this.errorService = errorService;
  }

  assignTask = async (args: ITaskAssignmentCreate) => {
    const operation = 'create';

    try {
      const employee_id = args.employee_id;
      const task_id = args.task_id;

      const user = await this.userRepository.getById({ id: employee_id });
      const task = await this.userRepository.getById({ id: task_id });
      console.log(user, task);
      if (!user) {
        console.log('not usrer');
        throw new ForbiddenError({
          details: [strings.userNotFound],
        });
      }
      if (!task) {
        console.log('not task');
        console.log(strings.taskNotFound);
        throw new ForbiddenError({
          details: [strings.taskNotFound],
        });
      }
      let taskAssignment = await this.taskAssigmentRepository.create({
        employee_id,
        task_id,
      });
      return taskAssignment;
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
