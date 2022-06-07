import { inject, injectable } from 'inversify';
import { Arg, Ctx, FieldResolver, Mutation, Query, Resolver, Root, UseMiddleware, Info } from 'type-graphql';

import { DeleteInput } from '../../entities/common.entity';
import Task, {
  AssignedUserQueryInput,
  AssignTaskInput,
  TaskCreateInput,
  TaskPagingResult,
  TaskQueryInput,
  TaskUpdateInput,
} from '../../entities/task.entity';

import { TYPES } from '../../types';
import Paging from '../../utils/paging';
import User from '../../entities/user.entity';
import { Role as RoleEnum } from '../../config/constants';
import TaskValidation from '../../validation/task.validation';
import authorize from '../middlewares/authorize';
import authenticate from '../middlewares/authenticate';
import { checkCompanyAccess } from '../middlewares/company';
import { filterTasksForEmployees } from '../middlewares/task';

import { IErrorService, IJoiService } from '../../interfaces/common.interface';
import { IPaginationData } from '../../interfaces/paging.interface';
import { ITaskService } from '../../interfaces/task.interface';
import { IGraphqlContext } from '../../interfaces/graphql.interface';

@injectable()
@Resolver((of) => Task)
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
  @UseMiddleware(authenticate, checkCompanyAccess, filterTasksForEmployees)
  async Task(@Arg('input') args: TaskQueryInput, @Ctx() ctx: any): Promise<IPaginationData<Task>> {
    const operation = 'Tasks';

    try {
      const pagingArgs = Paging.createPagingPayload(args);
      let result: IPaginationData<Task> = await this.taskService.getAllAndCount(pagingArgs);
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

  @Query((returns) => [User])
  @UseMiddleware(authenticate, checkCompanyAccess)
  async AssignedUser(@Arg('input', { nullable: true }) args: AssignedUserQueryInput, @Ctx() ctx: any): Promise<User[]> {
    const operation = 'Tasks';

    try {
      const id = args.id;
      let result = await this.taskService.getAssignedUserById({ id });
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
  @UseMiddleware(authenticate, authorize(RoleEnum.CompanyAdmin, RoleEnum.SuperAdmin), checkCompanyAccess)
  async TaskCreate(@Arg('input') args: TaskCreateInput, @Ctx() ctx: any): Promise<Task> {
    const operation = 'TaskCreate';
    try {
      const name = args.name;
      const description = args.description;
      const status = args.status;
      const archived = args.archived;
      const active = args?.active;
      const manager_id = args.manager_id;
      const company_id = args.company_id;
      const project_id = args.project_id;
      const user_ids = args?.user_ids;
      const attachment_ids = args.attachment_ids;

      const schema = TaskValidation.create();
      await this.joiService.validate({
        schema,
        input: {
          name,
          description,
          status,
          active,
          archived,
          manager_id,
          company_id,
          project_id,
          user_ids,
          attachment_ids,
        },
      });
      let task: Task = await this.taskService.create({
        name,
        description,
        status,
        active,
        archived,
        manager_id,
        company_id,
        project_id,
        user_ids,
        attachment_ids,
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
  @UseMiddleware(
    authenticate,
    authorize(RoleEnum.CompanyAdmin, RoleEnum.SuperAdmin, RoleEnum.Employee),
    checkCompanyAccess
  )
  async TaskUpdate(@Arg('input') args: TaskUpdateInput, @Ctx() ctx: any): Promise<Task> {
    const operation = 'TaskUpdate';

    try {
      const id = args.id;
      const name = args.name;
      const description = args.description;
      const status = args.status;
      const archived = args.archived;
      const active = args.active;
      const manager_id = args.manager_id;
      const project_id = args.project_id;
      const user_ids = args.user_ids;
      const priority = args.priority;
      const deadline = args.deadline;
      const attachment_ids = args.attachment_ids;

      const schema = TaskValidation.update();
      await this.joiService.validate({
        schema,
        input: {
          id,
          name,
          description,
          status,
          archived,
          active,
          manager_id,
          project_id,
          user_ids,
          priority,
          deadline,
          attachment_ids,
        },
      });

      let Task: Task = await this.taskService.update({
        id,
        name,
        description,
        status,
        archived,
        active,
        manager_id,
        project_id,
        user_ids,
        priority,
        deadline,
        attachment_ids,
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
  async TaskDelete(@Arg('input') args: DeleteInput, @Ctx() ctx: any): Promise<Task> {
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

  @Mutation((returns) => Task)
  @UseMiddleware(authenticate)
  async AssignTask(@Arg('input') args: AssignTaskInput, @Ctx() ctx: any): Promise<Task> {
    const operation = 'TaskAssign';
    try {
      const user_id = args.user_id;
      const task_id = args.task_id;
      const schema = TaskValidation.assignTask();
      await this.joiService.validate({
        schema,
        input: {
          user_id,
          task_id,
        },
      });
      let task: Task = await this.taskService.assignTask({
        user_id,
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
  @FieldResolver()
  project(@Root() root: Task, @Ctx() ctx: IGraphqlContext) {
    return ctx.loaders.projectByIdLoader.load(root.project_id);
  }

  @FieldResolver()
  manager(@Root() root: Task, @Ctx() ctx: IGraphqlContext) {
    return ctx.loaders.usersByIdLoader.load(root.manager_id);
  }

  @FieldResolver()
  async users(@Root() root: Task, @Ctx() ctx: IGraphqlContext) {
    return ctx.loaders.usersByTaskIdLoader.load(root.id);
  }

  @FieldResolver()
  async attachments(@Root() root: Task, @Ctx() ctx: IGraphqlContext) {
    return ctx.loaders.attachmentsByTaskIdLoader.load(root.id);
  }
}
