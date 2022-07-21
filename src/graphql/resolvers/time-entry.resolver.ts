import set from 'lodash/set';
import { inject, injectable } from 'inversify';
import { Arg, Ctx, FieldResolver, Mutation, Query, Resolver, Root, UseMiddleware } from 'type-graphql';

import { TYPES } from '../../types';
import strings from '../../config/strings';
import * as apiError from '../../utils/api-error';
import TimeEntry, {
  TimeEntryCreateInput,
  TimeEntryPagingResult,
  TimeEntryQueryInput,
  TimeEntryUpdateInput,
  TimeEntryWeeklyDetailsInput,
  TimeEntryDeleteInput,
  TimeEntryBulkDeleteInput,
  TimeEntryApproveRejectInput,
  TotalDurationCountInput,
  TimeEntryUnlockInput,
} from '../../entities/time-entry.entity';
import Paging from '../../utils/paging';
import authenticate from '../middlewares/authenticate';
import { checkCompanyAccess } from '../middlewares/company';
import authorize from '../middlewares/authorize';
import TimeEntryValidation from '../../validation/time-entry.validation';
import { Role as RoleEnum, events } from '../../config/constants';
import timeEntryEmitter from '../../subscribers/timeEntry.subscriber';

import { IErrorService, IJoiService } from '../../interfaces/common.interface';
import { IPaginationData } from '../../interfaces/paging.interface';
import { ITimeEntryService, ITimeEntryRepository } from '../../interfaces/time-entry.interface';
import { IGraphqlContext } from '../../interfaces/graphql.interface';
import { canCreateTimeEntry, checkRoleAndFilterTimeEntry } from '../middlewares/time-entry';

@injectable()
@Resolver((of) => TimeEntry)
export class TimeEntryResolver {
  private name = 'TimeEntryResolver';
  private timeEntryService: ITimeEntryService;
  private joiService: IJoiService;
  private errorService: IErrorService;
  private timeEntryRepository: ITimeEntryRepository;

  constructor(
    @inject(TYPES.TimeEntryService) timeEntryService: ITimeEntryService,
    @inject(TYPES.JoiService) joiService: IJoiService,
    @inject(TYPES.ErrorService) errorService: IErrorService,
    @inject(TYPES.TimeEntryRepository) _timeEntryRepository: ITimeEntryRepository
  ) {
    this.timeEntryService = timeEntryService;
    this.joiService = joiService;
    this.errorService = errorService;
    this.timeEntryRepository = _timeEntryRepository;
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

  @Query((returns) => Number)
  @UseMiddleware(authenticate, checkCompanyAccess)
  async TotalDuration(
    @Arg('input', { nullable: true }) args: TotalDurationCountInput,
    @Ctx() ctx: any
  ): Promise<number> {
    const operation = 'User';
    try {
      let result: number = await this.timeEntryRepository.totalDuration(args);
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
      const startTime = args.startTime;
      const endTime = args.endTime;
      const company_id = args.company_id;
      let created_by = args?.created_by;
      const client_id = args?.client_id;

      // Show timeEntry of the logged in users if created_by is not provided
      if (!created_by) {
        created_by = ctx?.user?.id ?? '';
      }

      const schema = TimeEntryValidation.weeklyDetails();
      await this.joiService.validate({
        schema,
        input: {
          company_id,
          startTime,
          endTime,
        },
      });

      if (startTime && !endTime) {
        throw new apiError.ValidationError({
          details: [strings.endDateRequired],
        });
      }

      if (endTime && !startTime) {
        throw new apiError.ValidationError({
          details: [strings.startDateRequired],
        });
      }

      const timeEntry = await this.timeEntryService.getWeeklyDetails({
        company_id,
        created_by,
        startTime,
        endTime,
        client_id,
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
  @UseMiddleware(authenticate, authorize(RoleEnum.Employee), checkCompanyAccess)
  async TimeEntryCreate(@Arg('input') args: TimeEntryCreateInput, @Ctx() ctx: IGraphqlContext): Promise<TimeEntry> {
    const operation = 'TimeEntryCreate';

    try {
      const startTime = args.startTime;
      const endTime = args.endTime;
      const clientLocation = args.clientLocation;
      const project_id = args.project_id;
      const company_id = args.company_id;
      const entryType = ctx?.user?.type;
      const description = args.description;
      const created_by = ctx?.user?.id as string;

      const schema = TimeEntryValidation.create();
      await this.joiService.validate({
        schema,
        input: {
          startTime,
          endTime,
          clientLocation,
          project_id,
          company_id,
          created_by,
          description,
        },
      });

      let timeEntry: TimeEntry = await this.timeEntryService.create({
        startTime,
        endTime,
        clientLocation,
        project_id,
        company_id,
        created_by,
        entryType,
        description,
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
      const startTime = args.startTime;
      const endTime = args.endTime;
      const clientLocation = args.clientLocation;
      const project_id = args.project_id;
      const company_id = args.company_id;
      const created_by = args.created_by;
      const description = args.description;

      const schema = TimeEntryValidation.update();
      await this.joiService.validate({
        schema,
        input: {
          id,
          startTime,
          endTime,
          clientLocation,
          project_id,
          company_id,
          created_by,
          description,
        },
      });

      const timeEntry: TimeEntry = await this.timeEntryService.update({
        id,
        startTime,
        endTime,
        clientLocation,
        project_id,
        company_id,
        created_by,
        description,
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
    const operation = 'TimeEntryDelete';

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

  @Mutation((returns) => [TimeEntry])
  @UseMiddleware(authenticate, checkCompanyAccess, checkRoleAndFilterTimeEntry)
  async TimeEntryBulkDelete(
    @Arg('input') args: TimeEntryBulkDeleteInput,
    @Ctx() ctx: IGraphqlContext
  ): Promise<TimeEntry[]> {
    const operation = 'TimeEntryBulkDelete';

    try {
      const ids = args.ids;
      const created_by = args.created_by;
      const company_id = args.company_id;
      const client_id = args.client_id;

      const schema = TimeEntryValidation.bulkDelete();
      await this.joiService.validate({
        schema,
        input: {
          ids,
          created_by,
          company_id,
          client_id,
        },
      });
      let timeEntry: TimeEntry[] = await this.timeEntryService.bulkRemove({
        ids,
        created_by,
        company_id,
        client_id,
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

  @Mutation((returns) => Boolean)
  @UseMiddleware(
    authenticate,
    authorize(RoleEnum.CompanyAdmin, RoleEnum.SuperAdmin, RoleEnum.TaskManager),
    checkCompanyAccess
  )
  async TimeEntriesApproveReject(
    @Arg('input') args: TimeEntryApproveRejectInput,
    @Ctx() ctx: IGraphqlContext
  ): Promise<boolean> {
    const operation = 'TimeEntriesApproveReject';

    try {
      const ids = args.ids;
      const timesheet_id = args.timesheet_id;
      const approvalStatus = args.approvalStatus;
      const approver_id = ctx?.user?.id as string;

      const timeEntry = await this.timeEntryService.approveRejectTimeEntries({
        ids,
        approvalStatus,
        approver_id,
        timesheet_id,
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

  @Mutation((returns) => Boolean)
  @UseMiddleware(
    authenticate,
    authorize(RoleEnum.CompanyAdmin, RoleEnum.SuperAdmin, RoleEnum.TaskManager),
    checkCompanyAccess
  )
  async TimeEntriesUnlock(@Arg('input') args: TimeEntryUnlockInput, @Ctx() ctx: IGraphqlContext): Promise<boolean> {
    const operation = 'TimeEntriesUnlock';

    try {
      const user_id = args.user_id;
      const timesheet_id = args.timesheet_id;
      const statusToUnlock = args.statusToUnlock;
      const company_id = args.company_id;

      const timeEntry = await this.timeEntryRepository.unlockTimeEntries({
        company_id,
        timesheet_id,
        user_id,
        statusToUnlock,
      });

      // Emit onTimesheetUnlock event
      timeEntryEmitter.emit(events.onTimesheetUnlock, {
        timesheet_id,
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

  @FieldResolver()
  company(@Root() root: TimeEntry, @Ctx() ctx: IGraphqlContext) {
    return ctx.loaders.companyByIdLoader.load(root.company_id);
  }

  @FieldResolver()
  project(@Root() root: TimeEntry, @Ctx() ctx: IGraphqlContext) {
    return ctx.loaders.projectByIdLoader.load(root.project_id);
  }

  @FieldResolver()
  creator(@Root() root: TimeEntry, @Ctx() ctx: IGraphqlContext) {
    return ctx.loaders.usersByIdLoader.load(root.created_by);
  }

  @FieldResolver()
  async timesheet(@Root() root: TimeEntry, @Ctx() ctx: IGraphqlContext) {
    if (root.timesheet_id) {
      return ctx.loaders.timesheetByIdLoader.load(root.timesheet_id);
    }
  }
}
