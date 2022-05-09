import { inject, injectable } from 'inversify';
import { Arg, Ctx, Mutation, Query, Resolver, UseMiddleware } from 'type-graphql';
import { DeleteInput } from '../../entities/common.entity';
import Timesheet, { TimeSheetPagingResult, TimesheetQueryInput } from '../../entities/timesheet.entity';
import { IErrorService, IJoiService } from '../../interfaces/common.interface';
import { IGraphqlContext } from '../../interfaces/graphql.interface';
import { IPaginationData } from '../../interfaces/paging.interface';
import { ITimesheetService } from '../../interfaces/timesheet.interface';
import { TYPES } from '../../types';
import Paging from '../../utils/paging';
// import TimesheetValidation from '../../validation/timesheet.validation';
import authenticate from '../middlewares/authenticate';
import authorize from '../middlewares/authorize';
import { checkCompanyAccess } from '../middlewares/company';

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
}
