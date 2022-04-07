import { inject, injectable } from 'inversify';
import { Arg, Ctx, FieldResolver, Mutation, Query, Resolver, Root, UseMiddleware } from 'type-graphql';

import Workschedule, {
  WorkscheduleCreateInput,
  WorkschedulePagingResult,
  WorkscheduleQueryInput,
  WorkscheduleUpdateInput,
} from '../../entities/workschedule.entity';
import { DeleteInput } from '../../entities/common.entity';

import { IErrorService, IJoiService } from '../../interfaces/common.interface';
import { IPaginationData } from '../../interfaces/paging.interface';
import { IWorkscheduleService } from '../../interfaces/workschedule.interface';

import { TYPES } from '../../types';
import { Role as RoleEnum } from '../../config/constants';
import Paging from '../../utils/paging';

import authenticate from '../middlewares/authenticate';
import authorize from '../middlewares/authorize';

import { checkCompanyAccess } from '../middlewares/company';
import WorkscheduleValidation from '../../validation/workschedule.validation';
import { IGraphqlContext } from '../../interfaces/graphql.interface';

@injectable()
@Resolver((of) => Workschedule)
export class WorkscheduleResolver {
  private name = 'WorkscheduleResolver';
  private workscheduleService: IWorkscheduleService;
  private errorService: IErrorService;
  private joiService: IJoiService;

  constructor(
    @inject(TYPES.WorkscheduleService) workscheduleService: IWorkscheduleService,
    @inject(TYPES.ErrorService) errorService: IErrorService,
    @inject(TYPES.JoiService) _joiService: IJoiService
  ) {
    this.workscheduleService = workscheduleService;
    this.errorService = errorService;
    this.joiService = _joiService;
  }

  @Query((returns) => WorkschedulePagingResult)
  @UseMiddleware(authenticate)
  async Workschedule(
    @Arg('input', { nullable: true }) args: WorkscheduleQueryInput,
    @Ctx() ctx: any
  ): Promise<IPaginationData<Workschedule>> {
    const operation = 'Workschedules';

    try {
      const pagingArgs = Paging.createPagingPayload(args);
      let result: IPaginationData<Workschedule> = await this.workscheduleService.getAllAndCount(pagingArgs);

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

  @Mutation((returns) => Workschedule)
  @UseMiddleware(authenticate, authorize(RoleEnum.SuperAdmin, RoleEnum.CompanyAdmin), checkCompanyAccess)
  async WorkscheduleCreate(@Arg('input') args: WorkscheduleCreateInput, @Ctx() ctx: any): Promise<Workschedule> {
    const operation = 'WorkscheduleCreate';
    try {
      const date = args.date;
      const from = args.from;
      const to = args.to;
      const task_id = args.task_id;
      const user_id = args.user_id;
      const company_id = args.company_id;

      const schema = WorkscheduleValidation.create();
      await this.joiService.validate({
        schema,
        input: {
          date,
          from,
          to,
          task_id,
          user_id,
          company_id,
        },
      });

      let workschedule: Workschedule = await this.workscheduleService.create({
        date,
        from,
        to,
        task_id,
        user_id,
        company_id,
      });

      return workschedule;
    } catch (err) {
      this.errorService.throwError({
        err,
        name: this.name,
        operation,
        logError: false,
      });
    }
  }

  @Mutation((returns) => Workschedule)
  @UseMiddleware(authenticate, authorize(RoleEnum.SuperAdmin, RoleEnum.CompanyAdmin), checkCompanyAccess)
  async WorkscheduleUpdate(@Arg('input') args: WorkscheduleUpdateInput, @Ctx() ctx: any): Promise<Workschedule> {
    const operation = 'WorkscheduleUpdate';

    try {
      const id = args.id;
      const date = args.date;
      const from = args.from;
      const to = args.to;
      const task_id = args.task_id;
      const user_id = args.user_id;
      const company_id = args.company_id;

      const schema = WorkscheduleValidation.update();
      await this.joiService.validate({
        schema,
        input: {
          id,
          date,
          from,
          to,
          task_id,
          user_id,
          company_id,
        },
      });

      let workschedule: Workschedule = await this.workscheduleService.update({
        id,
        date,
        from,
        to,
        task_id,
        user_id,
        company_id,
      });

      return workschedule;
    } catch (err) {
      this.errorService.throwError({
        err,
        name: this.name,
        operation,
        logError: false,
      });
    }
  }

  @Mutation((returns) => Workschedule)
  @UseMiddleware(authenticate, authorize(RoleEnum.SuperAdmin, RoleEnum.CompanyAdmin))
  async WorkscheduleDelete(@Arg('input') args: DeleteInput, @Ctx() ctx: any): Promise<Workschedule> {
    const operation = 'WorkscheduleDelete';

    try {
      const id = args.id;
      let workschedule: Workschedule = await this.workscheduleService.remove({ id });

      return workschedule;
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
  async tasks(@Root() root: Workschedule, @Ctx() ctx: IGraphqlContext) {
    if (root.task_id) {
      return await ctx.loaders.tasksByIdLoader.load(root.task_id);
    }
  }
  @FieldResolver()
  async user(@Root() root: Workschedule, @Ctx() ctx: IGraphqlContext) {
    if (root.user_id) {
      return await ctx.loaders.usersByIdLoader.load(root.user_id);
    }
  }
  @FieldResolver()
  async company(@Root() root: Workschedule, @Ctx() ctx: IGraphqlContext) {
    if (root.company_id) {
      return await ctx.loaders.companyByIdLoader.load(root.company_id);
    }
  }
}
