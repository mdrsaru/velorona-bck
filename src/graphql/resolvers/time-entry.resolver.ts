import set from 'lodash/set';
import { inject, injectable } from 'inversify';
import { Arg, Ctx, FieldResolver, Mutation, Query, Resolver, Root, UseMiddleware } from 'type-graphql';

import { TYPES } from '../../types';
import strings from '../../config/strings';
import * as apiError from '../../utils/api-error';
import TimeEntry, {
  StopTimeEntryInput,
  TimeEntryCreateInput,
  TimeEntryPagingResult,
  TimeEntryQueryInput,
  TimeEntryUpdateInput,
  TimeEntryWeeklyDetailsInput,
  TimeEntryDeleteInput,
} from '../../entities/time-entry.entity';
import Paging from '../../utils/paging';
import authenticate from '../middlewares/authenticate';
import { checkCompanyAccess } from '../middlewares/company';
import authorize from '../middlewares/authorize';
import TimeEntryValidation from '../../validation/time-entry.validation';
import { Role as RoleEnum } from '../../config/constants';

import { IErrorService, IJoiService } from '../../interfaces/common.interface';
import { IPaginationData } from '../../interfaces/paging.interface';
import { ITimeEntryService } from '../../interfaces/time-entry.interface';
import { IGraphqlContext } from '../../interfaces/graphql.interface';

@injectable()
@Resolver((of) => TimeEntry)
export class TimeEntryResolver {
  private name = 'TimeEntryResolver';
  private timeEntryService: ITimeEntryService;
  private joiService: IJoiService;
  private errorService: IErrorService;

  constructor(
    @inject(TYPES.TimeEntryService) timeEntryService: ITimeEntryService,
    @inject(TYPES.JoiService) joiService: IJoiService,
    @inject(TYPES.ErrorService) errorService: IErrorService
  ) {
    this.timeEntryService = timeEntryService;
    this.joiService = joiService;
    this.errorService = errorService;
  }

  @Query((returns) => TimeEntryPagingResult)
  @UseMiddleware(authenticate, checkCompanyAccess)
  async TimeEntry(
    @Arg('input') args: TimeEntryQueryInput,
    @Ctx() ctx: IGraphqlContext
  ): Promise<IPaginationData<TimeEntry>> {
    const operation = 'TimeEntrys';

    try {
      const created_by = args?.query?.created_by;

      // Show timeEntry of the logged in users if created_by is not provided
      if (!created_by) {
        set(args, 'query.created_by', ctx?.user?.id);
      }

      const pagingArgs = Paging.createPagingPayload(args);

      let result: IPaginationData<TimeEntry> = await this.timeEntryService.getAllAndCount(pagingArgs);

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

  @Query((returns) => [TimeEntry])
  @UseMiddleware(authenticate, checkCompanyAccess)
  async TimeEntryWeeklyDetails(
    @Arg('input') args: TimeEntryWeeklyDetailsInput,
    @Ctx() ctx: IGraphqlContext
  ): Promise<TimeEntry[]> {
    const operation = 'TimeEntryWeeklyDetails';

    try {
      const start = args.start;
      const end = args.end;
      const company_id = args.company_id;
      let created_by = args?.created_by;

      // Show timeEntry of the logged in users if created_by is not provided
      if (!created_by) {
        created_by = ctx?.user?.id ?? '';
      }

      const schema = TimeEntryValidation.weeklyDetails();
      await this.joiService.validate({
        schema,
        input: {
          company_id,
          start,
          end,
        },
      });

      if (start && !end) {
        throw new apiError.ValidationError({
          details: [strings.endDateRequired],
        });
      }

      if (end && !start) {
        throw new apiError.ValidationError({
          details: [strings.startDateRequired],
        });
      }

      const timeEntry = await this.timeEntryService.getWeeklyDetails({
        company_id,
        created_by,
        start,
        end,
      });

      return timeEntry;
    } catch (err) {
      this.errorService.throwError({
        err,
        name: this.name,
        operation,
        logError: false,
      });
    }
  }

  @Mutation((returns) => TimeEntry)
  @UseMiddleware(authenticate, checkCompanyAccess)
  async TimeEntryCreate(@Arg('input') args: TimeEntryCreateInput, @Ctx() ctx: any): Promise<TimeEntry> {
    const operation = 'TimeEntryCreate';

    try {
      const start = args.start;
      const end = args.end;
      const clientLocation = args.clientLocation;
      const project_id = args.project_id;
      const company_id = args.company_id;
      const created_by = ctx.user.id;
      const task_id = args.task_id;

      const schema = TimeEntryValidation.create();
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

      let timeEntry: TimeEntry = await this.timeEntryService.create({
        start,
        end,
        clientLocation,
        project_id,
        company_id,
        created_by,
        task_id,
      });

      return timeEntry;
    } catch (err) {
      console.log(err, 'err');
      this.errorService.throwError({
        err,
        name: this.name,
        operation,
        logError: false,
      });
    }
  }

  @Mutation((returns) => TimeEntry)
  @UseMiddleware(authenticate, checkCompanyAccess)
  async StopTimeEntry(@Arg('input') args: StopTimeEntryInput): Promise<TimeEntry> {
    const operation = 'TimeEntryCreate';
    try {
      const id = args.id;
      const end = args.end;

      const schema = TimeEntryValidation.stop();
      await this.joiService.validate({
        schema,
        input: {
          id,
          end,
        },
      });

      let timeEntry: TimeEntry = await this.timeEntryService.update({
        id,
        end,
      });

      return timeEntry;
    } catch (err) {
      this.errorService.throwError({
        err,
        name: this.name,
        operation,
        logError: false,
      });
    }
  }

  @Mutation((returns) => TimeEntry)
  @UseMiddleware(
    authenticate,
    authorize(RoleEnum.CompanyAdmin, RoleEnum.SuperAdmin, RoleEnum.Employee, RoleEnum.TaskManager),
    checkCompanyAccess
  )
  async TimeEntryUpdate(@Arg('input') args: TimeEntryUpdateInput): Promise<TimeEntry> {
    const operation = 'TimeEntryUpdate';
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

      const schema = TimeEntryValidation.update();
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

      const timeEntry: TimeEntry = await this.timeEntryService.update({
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

      return timeEntry;
    } catch (err) {
      this.errorService.throwError({
        err,
        name: this.name,
        operation,
        logError: false,
      });
    }
  }
  @Mutation((returns) => TimeEntry)
  @UseMiddleware(
    authenticate,
    authorize(RoleEnum.CompanyAdmin, RoleEnum.SuperAdmin, RoleEnum.Employee, RoleEnum.TaskManager),
    checkCompanyAccess
  )
  async TimeEntryDelete(@Arg('input') args: TimeEntryDeleteInput): Promise<TimeEntry> {
    const operation = 'TaskDelete';

    try {
      const id = args.id;

      let timeEntry: TimeEntry = await this.timeEntryService.remove({ id });

      return timeEntry;
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
  company(@Root() root: TimeEntry, @Ctx() ctx: IGraphqlContext) {
    return ctx.loaders.companyByIdLoader.load(root.company_id);
  }

  @FieldResolver()
  project(@Root() root: TimeEntry, @Ctx() ctx: IGraphqlContext) {
    return ctx.loaders.projectByIdLoader.load(root.project_id);
  }

  @FieldResolver()
  approver(@Root() root: TimeEntry, @Ctx() ctx: IGraphqlContext) {
    if (root.approver_id) {
      return ctx.loaders.usersByIdLoader.load(root.approver_id);
    }

    return null;
  }

  @FieldResolver()
  creator(@Root() root: TimeEntry, @Ctx() ctx: IGraphqlContext) {
    return ctx.loaders.usersByIdLoader.load(root.created_by);
  }

  @FieldResolver()
  task(@Root() root: TimeEntry, @Ctx() ctx: IGraphqlContext) {
    return ctx.loaders.tasksByIdLoader.load(root.task_id);
  }
}
