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
    const schedule_date = args.schedule_date;
    const startTime = args.startTime;
    const endTime = args.endTime;
    const workschedule_id = args.workschedule_id;
    const user_id = args.user_id;

    try {
      const startTime1 = moment(startTime);
      const endTime1 = moment(endTime);
      const duration = endTime1?.diff(startTime1, 'seconds');

      const workscheduleDetail = await this.workscheduleDetailRepository.create({
        schedule_date,
        workschedule_id,
        user_id,
        startTime,
        endTime,
        duration: duration,
      });

      /* Update payroll allocated hours on new workschedule created*/
      await this.updateWorkschedule({
        startTime,
        workschedule_id: workschedule_id,
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
    const schedule_date = args.schedule_date;
    const startTime = args.startTime;
    const endTime = args.endTime;
    const workschedule_id = args.workschedule_id;
    const user_id = args.user_id;

    try {
      let workscheduleDetail = await this.workscheduleDetailRepository.update({
        id,
        schedule_date,
        startTime,
        endTime,
        workschedule_id,
        user_id,
      });

      /* Update payroll allocated hours on new workschedule created*/
      await this.updateWorkschedule({
        startTime,
        workschedule_id: workschedule_id,
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

      const found = await this.workscheduleDetailRepository.getById({
        id,
      });
      const workscheduleDetail = await this.workscheduleDetailRepository.remove({
        id,
      });

      await this.updateWorkschedule({
        startTime: found?.schedule_date,
        workschedule_id: found?.workschedule_id,
      });
      return workscheduleDetail;
    } catch (err) {
      throw err;
    }
  };

  updateWorkschedule = async (args: any) => {
    const startTime = args.startTime;
    const id = args.workschedule_id;

    const startDate = moment(startTime).startOf('isoWeek');
    const endDate = moment(startTime).endOf('isoWeek');

    const totalTimeInSeconds = await this.workscheduleTimeDetailRepository.getTotalTimeInSeconds({
      startTime: startDate.format('YYYY-MM-DDTHH:mm:ss'),
      endTime: endDate.format('YYYY-MM-DDTHH:mm:ss'),
    });

    await this.workscheduleRepository.update({
      id,
      payrollAllocatedHours: totalTimeInSeconds,
    });
  };
}
