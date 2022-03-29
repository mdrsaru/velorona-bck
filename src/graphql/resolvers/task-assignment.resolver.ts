import { inject, injectable } from 'inversify';
import { Arg, Ctx, Mutation, Resolver, UseMiddleware } from 'type-graphql';
import TaskAssignment, { AssignTaskCreateInput } from '../../entities/task-assignment.entity';
import { IErrorService, IJoiService } from '../../interfaces/common.interface';
import { ITaskAssignmentService } from '../../interfaces/task-assignment.interface';
import { TYPES } from '../../types';
import TaskAssignmentValidation from '../../validation/task-assignment.validation';
import authenticate from '../middlewares/authenticate';

@injectable()
@Resolver()
export class TaskAssignmentResolver {
  private name = 'TaskAssignmentResolver';
  private taskAssignmentService: ITaskAssignmentService;
  private joiService: IJoiService;
  private errorService: IErrorService;

  constructor(
    @inject(TYPES.TaskAssignmentService)
    taskAssignmentService: ITaskAssignmentService,
    @inject(TYPES.JoiService) joiService: IJoiService,
    @inject(TYPES.ErrorService) errorService: IErrorService
  ) {
    this.taskAssignmentService = taskAssignmentService;
    this.joiService = joiService;
    this.errorService = errorService;
  }

  @Mutation((returns) => TaskAssignment)
  @UseMiddleware(authenticate)
  async AssignTask(@Arg('input') args: AssignTaskCreateInput, @Ctx() ctx: any): Promise<TaskAssignment> {
    const operation = 'TaskCreate';
    try {
      const employee_id = args.employee_id;
      const task_id = args.task_id;
      const schema = TaskAssignmentValidation.assignTask();
      await this.joiService.validate({
        schema,
        input: {
          employee_id,
          task_id,
        },
      });
      let task: TaskAssignment = await this.taskAssignmentService.assignTask({
        employee_id,
        task_id,
      });
      return task;
    } catch (err) {
      this.errorService.throwError({
        err,
        name: this.name,
        operation,
        logError: false,
      });
    }
  }
}
