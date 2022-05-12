import { inject, injectable } from 'inversify';
import { Arg, Ctx, Mutation, Query, Resolver, UseMiddleware, FieldResolver, Root } from 'type-graphql';

import { TYPES } from '../../types';
import { Role as RoleEnum, TimesheetStatus } from '../../config/constants';
import Paging from '../../utils/paging';
import authenticate from '../middlewares/authenticate';
import authorize from '../middlewares/authorize';
import { checkCompanyAccess } from '../middlewares/company';
import { filterTimesheetByUser } from '../middlewares/timesheet';

import { DeleteInput } from '../../entities/common.entity';
import Timesheet, {
  TimeSheetPagingResult,
  TimesheetQueryInput,
  TimesheetApproveInput,
  TimesheetSubmitInput,
} from '../../entities/timesheet.entity';

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
  @UseMiddleware(authenticate, checkCompanyAccess, filterTimesheetByUser)
  async Timesheet(
    @Arg('input') args: TimesheetQueryInput,
    @Ctx() ctx: IGraphqlContext
  ): Promise<IPaginationData<Timesheet>> {
    const operation = 'Timesheet';

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

  @Mutation((returns) => Timesheet)
  @UseMiddleware(
    authenticate,
    authorize(RoleEnum.CompanyAdmin, RoleEnum.SuperAdmin, RoleEnum.TaskManager),
    checkCompanyAccess
  )
  async TimesheetApprove(@Arg('input') args: TimesheetApproveInput, @Ctx() ctx: IGraphqlContext): Promise<Timesheet> {
    const operation = 'TimesheetApprove';

    try {
      const id = args.id;
      const status = TimesheetStatus.Approved;
      const lastApprovedAt = new Date();
      const approver_id = ctx?.user?.id;

      const timesheet = await this.timesheetService.update({
        id,
        status,
        lastApprovedAt,
        approver_id,
      });

      return timesheet;
    } catch (err) {
      this.errorService.throwError({
        err,
        name: this.name,
        operation,
        logError: true,
      });
    }
  }

  @Mutation((returns) => Timesheet)
  @UseMiddleware(
    authenticate,
    authorize(RoleEnum.CompanyAdmin, RoleEnum.SuperAdmin, RoleEnum.Employee),
    checkCompanyAccess
  )
  async TimesheetSubmit(@Arg('input') args: TimesheetSubmitInput): Promise<Timesheet> {
    const operation = 'TimesheetSubmit';

    try {
      const id = args.id;
      const isSubmitted = true;
      const lastSubmittedAt = new Date();

      const timesheet = await this.timesheetService.update({
        id,
        isSubmitted,
        lastSubmittedAt,
      });

      return timesheet;
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

    return null;
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
