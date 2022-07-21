import { inject, injectable } from 'inversify';
import { Arg, Ctx, Field, FieldResolver, Mutation, Query, Resolver, Root, UseMiddleware } from 'type-graphql';

import { DeleteInput } from '../../entities/common.entity';

import { IErrorService, IJoiService } from '../../interfaces/common.interface';
import { IPaginationData } from '../../interfaces/paging.interface';

import { TYPES } from '../../types';
import { Role as RoleEnum } from '../../config/constants';
import Paging from '../../utils/paging';

import authenticate from '../middlewares/authenticate';
import authorize from '../middlewares/authorize';

import { IGraphqlContext } from '../../interfaces/graphql.interface';
import WorkscheduleDetail, {
  WorkscheduleDetailBulkDeleteInput,
  WorkscheduleDetailCreateInput,
  WorkscheduleDetailPagingResult,
  WorkscheduleDetailQueryInput,
  WorkscheduleDetailUpdateInput,
} from '../../entities/workschedule-details.entity';
import WorkscheduleDetailValidation from '../../validation/workschedule-detail.validation';
import { IWorkscheduleDetailService } from '../../interfaces/workschedule-detail.interface';
import workscheduleDetailValidation from '../../validation/workschedule-detail.validation';

@injectable()
@Resolver((of) => WorkscheduleDetail)
export class WorkscheduleDetailResolver {
  private name = 'WorkscheduleDetailResolver';
  private workscheduleDetailService: IWorkscheduleDetailService;
  private errorService: IErrorService;
  private joiService: IJoiService;

  constructor(
    @inject(TYPES.WorkscheduleDetailService) workscheduleDetailService: IWorkscheduleDetailService,
    @inject(TYPES.ErrorService) errorService: IErrorService,
    @inject(TYPES.JoiService) _joiService: IJoiService
  ) {
    this.workscheduleDetailService = workscheduleDetailService;
    this.errorService = errorService;
    this.joiService = _joiService;
  }

  @Query((returns) => WorkscheduleDetailPagingResult)
  @UseMiddleware(authenticate, authorize(RoleEnum.SuperAdmin, RoleEnum.CompanyAdmin, RoleEnum.Employee))
  async WorkscheduleDetail(
    @Arg('input', { nullable: true }) args: WorkscheduleDetailQueryInput,
    @Ctx() ctx: any
  ): Promise<IPaginationData<WorkscheduleDetail>> {
    const operation = 'WorkscheduleDetails';

    try {
      const pagingArgs = Paging.createPagingPayload(args);
      let result: IPaginationData<WorkscheduleDetail> = await this.workscheduleDetailService.getAllAndCount(pagingArgs);

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

  @Mutation((returns) => WorkscheduleDetail)
  @UseMiddleware(authenticate, authorize(RoleEnum.SuperAdmin, RoleEnum.CompanyAdmin))
  async WorkscheduleDetailCreate(
    @Arg('input') args: WorkscheduleDetailCreateInput,
    @Ctx() ctx: any
  ): Promise<WorkscheduleDetail> {
    const operation = 'WorkscheduleDetailCreate';
    try {
      const schedule_date = args.schedule_date;
      const startTime = args.startTime;
      const endTime = args.endTime;
      const workschedule_id = args.workschedule_id;
      const user_id = args.user_id;

      const schema = WorkscheduleDetailValidation.create();
      await this.joiService.validate({
        schema,
        input: {
          schedule_date,
          workschedule_id,
          user_id,
        },
      });

      let workscheduleDetail: WorkscheduleDetail = await this.workscheduleDetailService.create({
        schedule_date,
        startTime,
        endTime,
        workschedule_id,
        user_id,
      });

      return workscheduleDetail;
    } catch (err) {
      this.errorService.throwError({
        err,
        name: this.name,
        operation,
        logError: false,
      });
    }
  }

  @Mutation((returns) => WorkscheduleDetail)
  @UseMiddleware(authenticate, authorize(RoleEnum.SuperAdmin, RoleEnum.CompanyAdmin))
  async WorkscheduleDetailUpdate(
    @Arg('input') args: WorkscheduleDetailUpdateInput,
    @Ctx() ctx: any
  ): Promise<WorkscheduleDetail> {
    const operation = 'WorkscheduleUpdate';

    try {
      const id = args.id;
      const schedule_date = args.schedule_date;
      const startTime = args.startTime;
      const endTime = args.endTime;
      const workschedule_id = args.workschedule_id;
      const user_id = args.user_id;

      const schema = WorkscheduleDetailValidation.update();
      await this.joiService.validate({
        schema,
        input: {
          id,
          schedule_date,
          workschedule_id,
          user_id,
        },
      });

      let workscheduleDetail: WorkscheduleDetail = await this.workscheduleDetailService.update({
        id,
        schedule_date,
        startTime,
        endTime,
        workschedule_id,
        user_id,
      });

      return workscheduleDetail;
    } catch (err) {
      this.errorService.throwError({
        err,
        name: this.name,
        operation,
        logError: false,
      });
    }
  }

  @Mutation((returns) => WorkscheduleDetail)
  @UseMiddleware(authenticate, authorize(RoleEnum.SuperAdmin, RoleEnum.CompanyAdmin))
  async WorkscheduleDetailDelete(@Arg('input') args: DeleteInput, @Ctx() ctx: any): Promise<WorkscheduleDetail> {
    const operation = 'WorkscheduleDelete';

    try {
      const id = args.id;
      let workscheduleDetail: WorkscheduleDetail = await this.workscheduleDetailService.remove({ id });

      return workscheduleDetail;
    } catch (err) {
      this.errorService.throwError({
        err,
        name: this.name,
        operation,
        logError: false,
      });
    }
  }

  @Mutation((returns) => [WorkscheduleDetail])
  @UseMiddleware(authenticate)
  async WorkscheduleDetailBulkDelete(
    @Arg('input') args: WorkscheduleDetailBulkDeleteInput,
    @Ctx() ctx: IGraphqlContext
  ): Promise<WorkscheduleDetail[]> {
    const operation = 'WorkscheduleDetailBulkDelete';

    try {
      const ids = args.ids;
      const user_id = args.user_id;
      const workschedule_id = args.workschedule_id;

      const schema = workscheduleDetailValidation.bulkDelete();
      await this.joiService.validate({
        schema,
        input: {
          ids,
          user_id,
          workschedule_id,
        },
      });
      let WorkscheduleDetail: WorkscheduleDetail[] = await this.workscheduleDetailService.bulkRemove({
        ids,
        user_id,
        workschedule_id,
      });

      return WorkscheduleDetail;
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
  async user(@Root() root: WorkscheduleDetail, @Ctx() ctx: IGraphqlContext) {
    if (root.user_id) {
      return await ctx.loaders.usersByIdLoader.load(root.user_id);
    }
  }

  @FieldResolver()
  async workschedule(@Root() root: WorkscheduleDetail, @Ctx() ctx: IGraphqlContext) {
    if (root.workschedule_id) {
      return await ctx.loaders.workschedulesByIdLoader.load(root.workschedule_id);
    }
  }

  @FieldResolver()
  async workscheduleTimeDetail(@Root() root: WorkscheduleDetail, @Ctx() ctx: IGraphqlContext) {
    return await ctx.loaders.workscheduleTimeDetailByDetailIdLoader.load(root.id);
  }
}
