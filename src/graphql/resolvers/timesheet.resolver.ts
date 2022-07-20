import moment from 'moment';
import _ from 'lodash';
import { inject, injectable } from 'inversify';
import { Arg, Ctx, Mutation, Query, Resolver, UseMiddleware, FieldResolver, Root } from 'type-graphql';

import { TYPES } from '../../types';
import { Role as RoleEnum, TimeEntryApprovalStatus, TimesheetStatus } from '../../config/constants';
import Paging from '../../utils/paging';
import authenticate from '../middlewares/authenticate';
import authorize from '../middlewares/authorize';
import { checkCompanyAccess } from '../middlewares/company';
import { filterTimesheetByUser } from '../middlewares/timesheet';

import { DeleteInput } from '../../entities/common.entity';
import TimeEntry from '../../entities/time-entry.entity';
import Timesheet, {
  TimeSheetPagingResult,
  TimesheetQueryInput,
  TimesheetApproveRejectInput,
  TimesheetSubmitInput,
  TimesheetCountInput,
} from '../../entities/timesheet.entity';

import { IErrorService, IJoiService } from '../../interfaces/common.interface';
import { IGraphqlContext } from '../../interfaces/graphql.interface';
import { IPaginationData } from '../../interfaces/paging.interface';
import { ITimesheetRepository, ITimesheetService } from '../../interfaces/timesheet.interface';
import { ITimeEntryRepository } from '../../interfaces/time-entry.interface';

@injectable()
@Resolver((of) => Timesheet)
export class TimesheetResolver {
  private name = 'TimesheetResolver';
  private timesheetService: ITimesheetService;
  private joiService: IJoiService;
  private timeEntryRepository: ITimeEntryRepository;
  private timesheetRepository: ITimesheetRepository;
  private errorService: IErrorService;

  constructor(
    @inject(TYPES.TimesheetService) _timesheetService: ITimesheetService,
    @inject(TYPES.JoiService) _joiService: IJoiService,
    @inject(TYPES.ErrorService) _errorService: IErrorService,
    @inject(TYPES.TimeEntryRepository) _timeEntryRepository: ITimeEntryRepository,
    @inject(TYPES.TimesheetRepository) _timesheetRepository: ITimesheetRepository
  ) {
    this.timesheetService = _timesheetService;
    this.joiService = _joiService;
    this.timeEntryRepository = _timeEntryRepository;
    this.timesheetRepository = _timesheetRepository;
    this.errorService = _errorService;
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

  @Query((returns) => Number)
  @UseMiddleware(authenticate, checkCompanyAccess)
  async TimesheetCount(@Arg('input', { nullable: true }) args: TimesheetCountInput, @Ctx() ctx: any): Promise<Number> {
    const operation = 'User';
    try {
      let result: Number = await this.timesheetRepository.countTimesheet(args);
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
      return formatDuration(root.duration);
    }

    return null;
  }

  @FieldResolver()
  invoicedDurationFormat(@Root() root: Timesheet) {
    if (root.duration) {
      return formatDuration(root.invoicedDuration);
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

  @FieldResolver()
  totalExpense(@Root() root: Timesheet) {
    return root?.totalExpense ?? 0;
  }

  @FieldResolver()
  projectItems(@Root() root: Timesheet, @Ctx() ctx: IGraphqlContext) {
    const operation = 'projectItems';

    try {
      if (!root.weekStartDate || !root.weekEndDate) {
        return [];
      }

      const startTime = root.weekStartDate + 'T00:00:00';
      const endTime = root.weekEndDate + 'T23:59:59';
      const client_id = root.client_id;
      const company_id = root.company_id;
      const user_id = root.user_id;

      return this.timeEntryRepository.getProjectItems({
        client_id,
        company_id,
        startTime,
        endTime,
        user_id,
      });
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
  async durationMap(@Root() root: Timesheet, @Ctx() ctx: IGraphqlContext) {
    const operation = 'durationMap';

    try {
      if (!root.weekStartDate || !root.weekEndDate) {
        return {};
      }

      const startTime = root.weekStartDate + 'T00:00:00';
      const endTime = root.weekEndDate + 'T23:59:59';
      const client_id = root.client_id;
      const company_id = root.company_id;
      const user_id = root.user_id;

      return this.timeEntryRepository.getDurationMap({
        timesheet_id: root.id,
        startTime,
        endTime,
        user_id,
        client_id,
        company_id,
      });
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
  async timeEntries(@Root() root: Timesheet) {
    const operation = 'durationMap';

    try {
      if (!root.weekStartDate || !root.weekEndDate) {
        return [];
      }

      const startTime = new Date(root.weekStartDate + 'T00:00:00');
      const endTime = new Date(root.weekEndDate + 'T23:59:59');
      const client_id = root.client_id;
      const company_id = root.company_id;
      const user_id = root.user_id;

      const entries = this.timeEntryRepository.getWeeklyDetails({
        timesheet_id: root.id,
        startTime,
        endTime,
        created_by: user_id,
        client_id,
        company_id,
      });

      return entries;
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
  async entriesGroup(@Root() root: Timesheet) {
    const operation = 'durationMap';

    try {
      const timesheet_id = root.id;
      const startTime = new Date(root.weekStartDate + 'T00:00:00');
      const endTime = new Date(root.weekEndDate + 'T23:59:59');
      const client_id = root.client_id;
      const company_id = root.company_id;
      const user_id = root.user_id;

      const timeEntries = await this.timeEntryRepository.getWeeklyDetails({
        timesheet_id,
        startTime,
        endTime,
        created_by: user_id,
        client_id,
        company_id,
      });

      return groupTimeEntriesByStatusInvoice(timeEntries);
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

/**
 * Group the time entries by invoice_id and approval status
 * @returns {Object} { byInvoice: Array, byStatus: Array }
 */
function groupTimeEntriesByStatusInvoice(entries: TimeEntry[]) {
  const invoicedEntries: TimeEntry[] = [];
  const remainingEntries: TimeEntry[] = [];

  for (const entry of entries) {
    if (entry.invoice_id) {
      invoicedEntries.push(entry);
    } else {
      remainingEntries.push(entry);
    }
  }

  const byInvoice = _.chain(invoicedEntries)
    .groupBy('invoice_id')
    .map((value, key) => ({ invoice_id: key, entries: value }))
    .value();

  const byStatus = _.chain(remainingEntries)
    .groupBy('approvalStatus')
    .map((value, key) => ({ approvalStatus: key, entries: value }))
    .value();

  return {
    byInvoice,
    byStatus,
  };
}

function formatDuration(duration: number) {
  const hours = Math.floor(duration / 3600);
  const mins = Math.floor((duration % 3600) / 60);
  const seconds = Math.floor((duration % 3600) % 60);

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
