import { inject, injectable } from 'inversify';

import { TYPES } from '../types';
import Paging from '../utils/paging';

import { IPaginationData, IPagingArgs } from '../interfaces/paging.interface';
import { IEntityID, IEntityRemove, IErrorService, ILogger } from '../interfaces/common.interface';
import {
  IWorkscheduleDetailCreateInput,
  IWorkscheduleDetailRepository,
  IWorkscheduleDetailService,
  IWorkscheduleDetailUpdateInput,
} from '../interfaces/workschedule-detail.interface';
import WorkscheduleDetail from '../entities/workschedule-details.entity';
import workschedule from '../config/inversify/workschedule';
import { IWorkscheduleRepository } from '../interfaces/workschedule.interface';
import { IWorkscheduleTimeDetailRepository } from '../interfaces/workschedule-time-detail.interface';
import workscheduleDetail from '../config/inversify/workschedule-detail';
import moment from 'moment';

@injectable()
export default class WorkscheduleDetailService implements IWorkscheduleDetailService {
  private name = 'WorkscheduleDetail';
  private workscheduleDetailRepository: IWorkscheduleDetailRepository;
  private workscheduleTimeDetailRepository: IWorkscheduleTimeDetailRepository;
  private workscheduleRepository: IWorkscheduleRepository;
  private logger: ILogger;
  private errorService: IErrorService;

  constructor(
    @inject(TYPES.WorkscheduleDetailRepository) _workscheduleDetailRepository: IWorkscheduleDetailRepository,
    @inject(TYPES.WorkscheduleTimeDetailRepository)
    _workscheduleTimeDetailRepository: IWorkscheduleTimeDetailRepository,
    @inject(TYPES.WorkscheduleRepository) _workscheduleRepository: IWorkscheduleRepository,
    @inject(TYPES.LoggerFactory) loggerFactory: (name: string) => ILogger,
    @inject(TYPES.ErrorService) _errorService: IErrorService
  ) {
    this.workscheduleDetailRepository = _workscheduleDetailRepository;
    this.workscheduleTimeDetailRepository = _workscheduleTimeDetailRepository;
    this.workscheduleRepository = _workscheduleRepository;
    this.logger = loggerFactory(this.name);
    this.errorService = _errorService;
  }

  getAllAndCount = async (args: IPagingArgs): Promise<IPaginationData<WorkscheduleDetail>> => {
    try {
      const { rows, count } = await this.workscheduleDetailRepository.getAllAndCount(args);

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

  create = async (args: IWorkscheduleDetailCreateInput) => {
    const operation = 'create';
    const date = args.date;
    const startTime = args.startTime;
    const endTime = args.endTime;
    const workschedule_id = args.workschedule_id;
    const user_id = args.user_id;

    try {
      const startTime1 = moment(startTime);
      const endTime1 = moment(endTime);
      const duration = endTime1?.diff(startTime1, 'seconds');

      const workscheduleDetail = await this.workscheduleDetailRepository.create({
        date,
        workschedule_id,
        user_id,
        startTime,
        endTime,
        duration: duration,
      });

      await this.workscheduleTimeDetailRepository.create({
        startTime,
        endTime,
        workschedule_detail_id: workscheduleDetail?.id,
        duration: duration,
      });
      /* Update payroll allocated hours on new workschedule created*/
      await this.updateWorkschedule({
        total: duration,
        workschedule_id,
      });

      return workscheduleDetail;
    } catch (err) {
      this.errorService.throwError({
        err,
        operation,
        name: this.name,
        logError: true,
      });
    }
  };

  update = async (args: IWorkscheduleDetailUpdateInput) => {
    const operation = 'update';
    const id = args.id;
    const date = args.date;
    const startTime = args.startTime;
    const endTime = args.endTime;
    const workschedule_id = args.workschedule_id;
    const user_id = args.user_id;

    try {
      let workscheduleDetail = await this.workscheduleDetailRepository.update({
        id,
        date,
        startTime,
        endTime,
        workschedule_id,
        user_id,
      });

      const startTime1 = moment(startTime);
      const endTime1 = moment(endTime);
      const duration = endTime1?.diff(startTime1, 'seconds');

      /* Update payroll allocated hours on new workschedule created*/
      await this.updateWorkschedule({
        total: duration,
        workschedule_id,
      });
      return workscheduleDetail;
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
      const workscheduleDetail = await this.workscheduleDetailRepository.remove({
        id,
      });

      return workscheduleDetail;
    } catch (err) {
      throw err;
    }
  };

  updateWorkschedule = async (args: any) => {
    const id = args.workschedule_id;
    const total = args.total;
    const workschedule = await this.workscheduleRepository.getById({ id: id });
    const result = await this.workscheduleRepository.update({
      id,
      payrollAllocatedHours: workschedule?.payrollAllocatedHours + total,
    });
    return result;
  };
}
