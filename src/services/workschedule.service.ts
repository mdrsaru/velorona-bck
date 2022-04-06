import { inject, injectable } from 'inversify';

import { TYPES } from '../types';
import Paging from '../utils/paging';

import { IPaginationData, IPagingArgs } from '../interfaces/paging.interface';
import { IEntityID, IEntityRemove, IErrorService, ILogger } from '../interfaces/common.interface';

import {
  IWorkscheduleCreateInput,
  IWorkscheduleRepository,
  IWorkscheduleService,
  IWorkscheduleUpdateInput,
} from '../interfaces/workschedule.interface';
import Workschedule from '../entities/workschedule.entity';

@injectable()
export default class WorkscheduleService implements IWorkscheduleService {
  private name = 'Workschedule';
  private workscheduleRepository: IWorkscheduleRepository;
  private logger: ILogger;
  private errorService: IErrorService;

  constructor(
    @inject(TYPES.WorkscheduleRepository) _workscheduleRepository: IWorkscheduleRepository,
    @inject(TYPES.LoggerFactory) loggerFactory: (name: string) => ILogger,
    @inject(TYPES.ErrorService) _errorService: IErrorService
  ) {
    this.workscheduleRepository = _workscheduleRepository;
    this.logger = loggerFactory(this.name);
    this.errorService = _errorService;
  }

  getAllAndCount = async (args: IPagingArgs): Promise<IPaginationData<Workschedule>> => {
    try {
      const { rows, count } = await this.workscheduleRepository.getAllAndCount(args);

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

  create = async (args: IWorkscheduleCreateInput) => {
    const operation = 'create';
    const date = args.date;
    const from = args.from;
    const to = args.to;
    const task_id = args.task_id;
    const user_id = args.user_id;
    const company_id = args.company_id;

    try {
      const project = await this.workscheduleRepository.create({
        date,
        from,
        to,
        task_id,
        user_id,
        company_id,
      });

      return project;
    } catch (err) {
      this.errorService.throwError({
        err,
        operation,
        name: this.name,
        logError: true,
      });
    }
  };

  update = async (args: IWorkscheduleUpdateInput) => {
    const operation = 'update';
    const id = args.id;
    const date = args.date;
    const from = args.from;
    const to = args.to;
    const task_id = args.task_id;
    const user_id = args.user_id;
    const company_id = args.company_id;

    try {
      let project = await this.workscheduleRepository.update({
        id,
        date,
        from,
        to,
        task_id,
        user_id,
        company_id,
      });

      return project;
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

      const workschedule = await this.workscheduleRepository.remove({
        id,
      });

      return workschedule;
    } catch (err) {
      throw err;
    }
  };
}
