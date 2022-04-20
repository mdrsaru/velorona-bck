import { inject, injectable } from 'inversify';
import Timesheet from '../entities/timesheet.entity';
import { IEntityRemove, IErrorService, ILogger } from '../interfaces/common.interface';
import { IPaginationData, IPagingArgs } from '../interfaces/paging.interface';
import {
  ITimesheetCreateInput,
  ITimesheetRepository,
  ITimesheetService,
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
    const total_hours = args.total_hours;
    const total_expense = args.total_expense;
    const client_location = args.client_location;
    const approver_id = args.approver_id;
    const project_id = args.project_id;
    const company_id = args.company_id;
    const created_by = args.created_by;

    try {
      let timesheet = await this.timesheetRepository.create({
        total_hours,
        total_expense,
        client_location,
        approver_id,
        project_id,
        company_id,
        created_by,
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
    const total_hours = args.total_hours;
    const total_expense = args.total_expense;
    const client_location = args.client_location;
    const approver_id = args.approver_id;
    const project_id = args.project_id;
    const company_id = args.company_id;
    const created_by = args.created_by;

    try {
      let timesheet = await this.timesheetRepository.update({
        id,
        total_hours,
        total_expense,
        client_location,
        approver_id,
        project_id,
        company_id,
        created_by,
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
