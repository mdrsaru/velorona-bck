import { inject, injectable } from 'inversify';

import { TYPES } from '../types';
import Paging from '../utils/paging';

import { IPaginationData, IPagingArgs } from '../interfaces/paging.interface';
import { IEntityRemove, IErrorService, ILogger } from '../interfaces/common.interface';
import {
  IWorkscheduleTimeDetailRepository,
  IWorkscheduleTimeDetailService,
  IWorkscheduleTimeDetailUpdateInput,
} from '../interfaces/workschedule-time-detail.interface';
import { IWorkscheduleRepository } from '../interfaces/workschedule.interface';
import WorkscheduleTimeDetail from '../entities/workschedule-time-details.entity';

@injectable()
export default class WorkscheduleTimeDetailService implements IWorkscheduleTimeDetailService {
  private name = 'WorkscheduleTimeDetail';
  private workscheduleTimeDetailRepository: IWorkscheduleTimeDetailRepository;
  private workscheduleRepository: IWorkscheduleRepository;
  private logger: ILogger;
  private errorService: IErrorService;

  constructor(
    @inject(TYPES.WorkscheduleTimeDetailRepository)
    _workscheduleTimeDetailRepository: IWorkscheduleTimeDetailRepository,
    @inject(TYPES.WorkscheduleRepository) _workscheduleRepository: IWorkscheduleRepository,
    @inject(TYPES.LoggerFactory) loggerFactory: (name: string) => ILogger,
    @inject(TYPES.ErrorService) _errorService: IErrorService
  ) {
    this.workscheduleTimeDetailRepository = _workscheduleTimeDetailRepository;
    this.workscheduleTimeDetailRepository = _workscheduleTimeDetailRepository;
    this.workscheduleRepository = _workscheduleRepository;
    this.logger = loggerFactory(this.name);
    this.errorService = _errorService;
  }

  getAllAndCount = async (args: IPagingArgs): Promise<IPaginationData<WorkscheduleTimeDetail>> => {
    try {
      const { rows, count } = await this.workscheduleTimeDetailRepository.getAllAndCount(args);

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

  update = async (args: IWorkscheduleTimeDetailUpdateInput) => {
    const operation = 'update';
    const id = args.id;
    const startTime = args.startTime;
    const endTime = args.endTime;
    const workschedule_detail_id = args.workschedule_detail_id;

    try {
      let workscheduleTimeDetail = await this.workscheduleTimeDetailRepository.update({
        id,
        startTime,
        endTime,
        workschedule_detail_id,
      });

      return workscheduleTimeDetail;
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
      console.log(id);
      const workscheduleTimeDetail = await this.workscheduleTimeDetailRepository.remove({
        id,
      });

      return workscheduleTimeDetail;
    } catch (err) {
      throw err;
    }
  };
}
