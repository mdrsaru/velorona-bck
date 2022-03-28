import { inject, injectable } from 'inversify';
import {
  Arg,
  Ctx,
  Mutation,
  Query,
  Resolver,
  UseMiddleware,
} from 'type-graphql';

import { DeleteInput } from '../../entities/common.entity';
import Task, {
  TaskCreateInput,
  TaskPagingResult,
  TaskQueryInput,
  TaskUpdateInput,
} from '../../entities/task.entity';

import { TYPES } from '../../types';
import Paging from '../../utils/paging';
import { Role as RoleEnum } from '../../config/constants';

import authenticate from '../middlewares/authenticate';
import { canCreateTask, canViewTask } from '../middlewares/task';

import TaskValidation from '../../validation/task.validation';

import { IErrorService, IJoiService } from '../../interfaces/common.interface';
import { IPaginationData } from '../../interfaces/paging.interface';
import { ITaskService } from '../../interfaces/task.interface';
import authorize from '../middlewares/authorize';
@injectable()
@Resolver()
export class TaskResolver {
  private name = 'TaskResolver';
  private taskService: ITaskService;
  private joiService: IJoiService;
  private errorService: IErrorService;

  constructor(
    @inject(TYPES.TaskService) taskService: ITaskService,
    @inject(TYPES.JoiService) joiService: IJoiService,
    @inject(TYPES.ErrorService) errorService: IErrorService
  ) {
    this.taskService = taskService;
    this.joiService = joiService;
    this.errorService = errorService;
  }

  @Query((returns) => TaskPagingResult)
  @UseMiddleware(authenticate, canViewTask)
  async Task(
    @Arg('input', { nullable: true }) args: TaskQueryInput,
    @Ctx() ctx: any
  ): Promise<IPaginationData<Task>> {
    const operation = 'Tasks';

    try {
      const pagingArgs = Paging.createPagingPayload(args);
      let result: IPaginationData<Task> = await this.taskService.getAllAndCount(
        pagingArgs
      );
      return result;
    } catch (err) {
      this.errorService.throwError({
        err,
        name: this.name,
        operation,
        logError: true,
      });
    }
  }

  @Mutation((returns) => Task)
  @UseMiddleware(
    authenticate,
    authorize(RoleEnum.ClientAdmin, RoleEnum.SuperAdmin),
    canCreateTask
  )
  async TaskCreate(
    @Arg('input') args: TaskCreateInput,
    @Ctx() ctx: any
  ): Promise<Task> {
    const operation = 'TaskCreate';
    try {
      const name = args.name;
      const status = args.status;
      const is_archived = args.is_archived;
      const manager_id = args.manager_id;
      const client_id = args.client_id;

      const schema = TaskValidation.create();
      await this.joiService.validate({
        schema,
        input: {
          name,
          status,
          is_archived,
          manager_id,
          client_id,
        },
      });
      let task: Task = await this.taskService.create({
        name,
        status,
        is_archived,
        manager_id,
        client_id,
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

  @Mutation((returns) => Task)
  @UseMiddleware(authenticate)
  async TaskUpdate(
    @Arg('input') args: TaskUpdateInput,
    @Ctx() ctx: any
  ): Promise<Task> {
    const operation = 'TaskUpdate';

    try {
      const id = args.id;
      const name = args.name;
      const status = args.status;
      const is_archived = args.is_archived;
      const manager_id = args.manager_id;
      const client_id = args.client_id;

      const schema = TaskValidation.update();
      await this.joiService.validate({
        schema,
        input: {
          id,
          name,
          status,
          is_archived,
          manager_id,
          client_id,
        },
      });

      let Task: Task = await this.taskService.update({
        id,
        name,
        status,
        is_archived,
        manager_id,
        client_id,
      });

      return Task;
    } catch (err) {
      this.errorService.throwError({
        err,
        name: this.name,
        operation,
        logError: false,
      });
    }
  }

  @Mutation((returns) => Task)
  @UseMiddleware(authenticate)
  async TaskDelete(
    @Arg('input') args: DeleteInput,
    @Ctx() ctx: any
  ): Promise<Task> {
    const operation = 'TaskDelete';

    try {
      const id = args.id;
      let task: Task = await this.taskService.remove({ id });

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
