import { inject, injectable } from 'inversify';
import Timesheet from '../entities/timesheet.entity';
import { IEntityRemove, IErrorService, ILogger } from '../interfaces/common.interface';
import { IPaginationData, IPagingArgs } from '../interfaces/paging.interface';
import {
  ITimesheetCreateInput,
  ITimesheetRepository,
  ITimesheetService,
  ITimeSheetStopInput,
  ITimesheetUpdateInput,
} from '../interfaces/timesheet.interface';
import { TYPES } from '../types';
import Paging from '../utils/paging';

@injectable()
export default class TimesheetService implements ITimesheetService {
  private name = 'TimesheetService';
  private timesheetRepository: ITimesheetRepository;
  private logger: ILogger;
  private errorService: IErrorService;

  constructor(
    @inject(TYPES.TimesheetRepository) timesheetRepository: ITimesheetRepository,
    @inject(TYPES.LoggerFactory) loggerFactory: (name: string) => ILogger,
    @inject(TYPES.ErrorService) errorService: IErrorService
  ) {
    this.timesheetRepository = timesheetRepository;
    this.logger = loggerFactory(this.name);
    this.errorService = errorService;
  }

  getAllAndCount = async (args: IPagingArgs): Promise<IPaginationData<Timesheet>> => {
    try {
      const { rows, count } = await this.timesheetRepository.getAllAndCount(args);

      const paging = Paging.getPagingResult({
        ...args,
        total: count,
      });

      return {
        paging,
        data: rows,
      };
    } catch (err) {
      throw err;
    }
  };

  create = async (args: ITimesheetCreateInput) => {
    const operation = 'create';
    const start = args.start;
    const end = args.end;
    const clientLocation = args.clientLocation;
    const project_id = args.project_id;
    const company_id = args.company_id;
    const created_by = args.created_by;
    const task_id = args.task_id;

    try {
      let timesheet = await this.timesheetRepository.create({
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
        operation,
        name: this.name,
        logError: true,
      });
    }
  };
  update = async (args: ITimesheetUpdateInput) => {
    const operation = 'update';
    const id = args?.id;
    const start = args.start;
    const end = args.end;
    const clientLocation = args.clientLocation;
    const approver_id = args.approver_id;
    const project_id = args.project_id;
    const company_id = args.company_id;
    const created_by = args.created_by;
    const task_id = args.task_id;

    try {
      let timesheet = await this.timesheetRepository.update({
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
        operation,
        name: this.name,
        logError: true,
      });
    }
  };

  stop = async (args: ITimeSheetStopInput) => {
    const operation = 'stop';
    try {
      const id = args.id;
      const end = args.end;
      let timesheet = await this.timesheetRepository.update({
        id,
        end,
      });
      return timesheet;
    } catch (err) {
      this.errorService.throwError({
        err,
        operation,
        name: this.name,
        logError: true,
      });
    }
  };
  remove = async (args: IEntityRemove) => {
    try {
      const id = args.id;
      const role = await this.timesheetRepository.remove({
        id,
      });
      return role;
    } catch (err) {
      throw err;
    }
  };
}
