import { inject, injectable } from 'inversify';
import { Arg, Ctx, Mutation, Query, Resolver, UseMiddleware, FieldResolver, Root } from 'type-graphql';

import { TYPES } from '../../types';
import Paging from '../../utils/paging';
import authenticate from '../middlewares/authenticate';
import authorize from '../middlewares/authorize';
import { checkCompanyAccess } from '../middlewares/company';
import { DeleteInput } from '../../entities/common.entity';
import Timesheet, { TimeSheetPagingResult, TimesheetQueryInput } from '../../entities/timesheet.entity';

import { IErrorService, IJoiService } from '../../interfaces/common.interface';
import { IGraphqlContext } from '../../interfaces/graphql.interface';
import { IPaginationData } from '../../interfaces/paging.interface';
import { ITimesheetService } from '../../interfaces/timesheet.interface';

@injectable()
@Resolver((of) => Timesheet)
export class TimesheetResolver {
  private name = 'TimesheetResolver';
  private timesheetService: ITimesheetService;
  private joiService: IJoiService;
  private errorService: IErrorService;

  constructor(
    @inject(TYPES.TimesheetService) timesheetService: ITimesheetService,
    @inject(TYPES.JoiService) joiService: IJoiService,
    @inject(TYPES.ErrorService) errorService: IErrorService
  ) {
    this.timesheetService = timesheetService;
    this.joiService = joiService;
    this.errorService = errorService;
  }

  @Query((returns) => TimeSheetPagingResult)
  @UseMiddleware(authenticate, checkCompanyAccess)
  async Timesheet(
    @Arg('input') args: TimesheetQueryInput,
    @Ctx() ctx: IGraphqlContext
  ): Promise<IPaginationData<Timesheet>> {
    const operation = 'Timesheets';

    try {
      const pagingArgs = Paging.createPagingPayload(args);

      let result: IPaginationData<Timesheet> = await this.timesheetService.getAllAndCount(pagingArgs);

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
  durationFormat(@Root() root: Timesheet) {
    if (root.duration) {
      const hours = Math.floor(root.duration / 3600);
      const mins = Math.floor((root.duration % 3600) / 60);
      const seconds = Math.floor((root.duration % 3600) % 60);

      let _hours = hours + '';
      let _mins = mins + '';
      let _seconds = seconds + '';

      if (hours < 10) {
        _hours = '0' + hours;
      }

      if (mins < 10) {
        _mins = '0' + mins;
      }

      if (seconds < 10) {
        _seconds = '0' + seconds;
      }

      return `${_hours}:${_mins}:${_seconds}`;
    }

    return '';
  }

  @FieldResolver()
  company(@Root() root: Timesheet, @Ctx() ctx: IGraphqlContext) {
    return ctx.loaders.companyByIdLoader.load(root.company_id);
  }

  @FieldResolver()
  user(@Root() root: Timesheet, @Ctx() ctx: IGraphqlContext) {
    return ctx.loaders.usersByIdLoader.load(root.user_id);
  }

  @FieldResolver()
  client(@Root() root: Timesheet, @Ctx() ctx: IGraphqlContext) {
    return ctx.loaders.clientByIdLoader.load(root.client_id);
  }

  @FieldResolver()
  approver(@Root() root: Timesheet, @Ctx() ctx: IGraphqlContext) {
    if (root.approver_id) {
      return ctx.loaders.usersByIdLoader.load(root.approver_id);
    }

    return null;
  }
}
