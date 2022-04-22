import { inject, injectable } from 'inversify';
import { Arg, Ctx, FieldResolver, Mutation, Query, Resolver, Root, UseMiddleware } from 'type-graphql';
import Timesheet, {
  StopTimesheetInput,
  TimesheetCreateInput,
  TimesheetPagingResult,
  TimesheetQueryInput,
  TimesheetUpdateInput,
} from '../../entities/timesheet.entity';
import { IErrorService, IJoiService } from '../../interfaces/common.interface';
import { IPaginationData } from '../../interfaces/paging.interface';
import { ITimesheetService } from '../../interfaces/timesheet.interface';
import { TYPES } from '../../types';
import Paging from '../../utils/paging';

import { Role as RoleEnum } from '../../config/constants';

import authenticate from '../middlewares/authenticate';
import { checkCompanyAccess } from '../middlewares/company';
import authorize from '../middlewares/authorize';
import TimesheetValidation from '../../validation/timesheet.validation';
import { DeleteInput } from '../../entities/common.entity';
import { IGraphqlContext } from '../../interfaces/graphql.interface';

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

  @Query((returns) => TimesheetPagingResult)
  @UseMiddleware(authenticate, checkCompanyAccess)
  async Timesheet(@Arg('input') args: TimesheetQueryInput, @Ctx() ctx: any): Promise<IPaginationData<Timesheet>> {
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

  @Mutation((returns) => Timesheet)
  @UseMiddleware(authenticate, checkCompanyAccess)
  async TimesheetCreate(@Arg('input') args: TimesheetCreateInput, @Ctx() ctx: any): Promise<Timesheet> {
    const operation = 'TimesheetCreate';
    try {
      const start = args.start;
      const end = args.end;
      const clientLocation = args.clientLocation;
      const project_id = args.project_id;
      const company_id = args.company_id;
      const created_by = args.created_by;
      const task_id = args.task_id;

      const schema = TimesheetValidation.create();
      await this.joiService.validate({
        schema,
        input: {
          start,
          end,
          clientLocation,
          project_id,
          company_id,
          created_by,
          task_id,
        },
      });
      let timesheet: Timesheet = await this.timesheetService.create({
        start,
        end,
        clientLocation,
        project_id,
        company_id,
        created_by,
        task_id,
      });
      return timesheet;
    } catch (err) {
      this.errorService.throwError({
        err,
        name: this.name,
        operation,
        logError: false,
      });
    }
  }

  @Mutation((returns) => Timesheet)
  @UseMiddleware(authenticate, checkCompanyAccess)
  async StopTimesheet(@Arg('input') args: StopTimesheetInput, @Ctx() ctx: any): Promise<Timesheet> {
    const operation = 'TimesheetCreate';
    try {
      const id = args.id;
      const end = args.end;

      const schema = TimesheetValidation.stop();
      await this.joiService.validate({
        schema,
        input: {
          id,
          end,
        },
      });
      let timesheet: Timesheet = await this.timesheetService.update({
        id,
        end,
      });
      return timesheet;
    } catch (err) {
      this.errorService.throwError({
        err,
        name: this.name,
        operation,
        logError: false,
      });
    }
  }

  @Mutation((returns) => Timesheet)
  @UseMiddleware(authenticate, authorize(RoleEnum.CompanyAdmin, RoleEnum.SuperAdmin), checkCompanyAccess)
  async TimesheetUpdate(@Arg('input') args: TimesheetUpdateInput, @Ctx() ctx: any): Promise<Timesheet> {
    const operation = 'TimesheetUpdate';
    try {
      const id = args.id;
      const start = args.start;
      const end = args.end;
      const clientLocation = args.clientLocation;
      const approver_id = args.approver_id;
      const project_id = args.project_id;
      const company_id = args.company_id;
      const created_by = args.created_by;
      const task_id = args.task_id;

      const schema = TimesheetValidation.update();
      await this.joiService.validate({
        schema,
        input: {
          id,
          start,
          end,
          clientLocation,
          approver_id,
          project_id,
          company_id,
          created_by,
          task_id,
        },
      });
      let timesheet: Timesheet = await this.timesheetService.update({
        id,
        start,
        end,
        clientLocation,
        approver_id,
        project_id,
        company_id,
        created_by,
        task_id,
      });
      return timesheet;
    } catch (err) {
      this.errorService.throwError({
        err,
        name: this.name,
        operation,
        logError: false,
      });
    }
  }
  @Mutation((returns) => Timesheet)
  @UseMiddleware(authenticate)
  async TimesheetDelete(@Arg('input') args: DeleteInput, @Ctx() ctx: any): Promise<Timesheet> {
    const operation = 'TaskDelete';

    try {
      const id = args.id;
      let timesheet: Timesheet = await this.timesheetService.remove({ id });

      return timesheet;
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
  company(@Root() root: Timesheet, @Ctx() ctx: IGraphqlContext) {
    if (root.company_id) {
      return ctx.loaders.companyByIdLoader.load(root.company_id);
    }

    return null;
  }

  @FieldResolver()
  project(@Root() root: Timesheet, @Ctx() ctx: IGraphqlContext) {
    if (root.project_id) {
      return ctx.loaders.projectByIdLoader.load(root.project_id);
    }

    return null;
  }

  @FieldResolver()
  approver(@Root() root: Timesheet, @Ctx() ctx: IGraphqlContext) {
    if (root.approver_id) {
      return ctx.loaders.usersByIdLoader.load(root.approver_id);
    }

    return null;
  }

  @FieldResolver()
  creator(@Root() root: Timesheet, @Ctx() ctx: IGraphqlContext) {
    if (root.created_by) {
      return ctx.loaders.usersByIdLoader.load(root.created_by);
    }

    return null;
  }
}
