import { inject, injectable } from 'inversify';
import { Arg, Ctx, FieldResolver, Query, Resolver, Root, UseMiddleware } from 'type-graphql';
import ActivityLog, { ActivityLogPagingResult, ActivityLogQueryInput } from '../../entities/activity-log.entity';
import { IActivityLogService } from '../../interfaces/activityLog.interface';
import { IErrorService } from '../../interfaces/common.interface';
import { IPaginationData } from '../../interfaces/paging.interface';
import { TYPES } from '../../types';
import Paging from '../../utils/paging';
import authenticate from '../middlewares/authenticate';
import { checkCompanyAccess } from '../middlewares/company';
import { IGraphqlContext } from '../../interfaces/graphql.interface';

@injectable()
@Resolver((of) => ActivityLog)
export class ActivityLogResolver {
  private name = 'ActivityLogResolver';
  private activityLogService: IActivityLogService;
  private errorService: IErrorService;

  constructor(
    @inject(TYPES.ActivityLogService) activityLogService: IActivityLogService,
    @inject(TYPES.ErrorService) errorService: IErrorService
  ) {
    this.activityLogService = activityLogService;
    this.errorService = errorService;
  }

  @Query((returns) => ActivityLogPagingResult)
  @UseMiddleware(authenticate, checkCompanyAccess)
  async ActivityLog(@Arg('input') args: ActivityLogQueryInput, @Ctx() ctx: any): Promise<IPaginationData<ActivityLog>> {
    const operation = 'ActivityLogs';

    try {
      const pagingArgs = Paging.createPagingPayload(args);
      let result: IPaginationData<ActivityLog> = await this.activityLogService.getAllAndCount(pagingArgs);

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

  @FieldResolver()
  async user(@Root() root: ActivityLog, @Ctx() ctx: IGraphqlContext) {
    if (root.user_id) {
      return await ctx.loaders.usersByIdLoader.load(root.user_id);
    }
  }
}
