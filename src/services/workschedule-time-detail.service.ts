import { inject, injectable } from 'inversify';

import { TYPES } from '../types';
import Paging from '../utils/paging';

import { IPaginationData, IPagingArgs } from '../interfaces/paging.interface';
import { IEntityRemove, IErrorService, ILogger } from '../interfaces/common.interface';
import {
  IWorkscheduleTimeDetailCreateInput,
  IWorkscheduleTimeDetailRepository,
  IWorkscheduleTimeDetailService,
  IWorkscheduleTimeDetailUpdateInput,
} from '../interfaces/workschedule-time-detail.interface';
import { IWorkscheduleRepository } from '../interfaces/workschedule.interface';
import WorkscheduleTimeDetail from '../entities/workschedule-time-details.entity';
import moment from 'moment';
import { IWorkscheduleDetailRepository } from '../interfaces/workschedule-detail.interface';

@injectable()
export default class WorkscheduleTimeDetailService implements IWorkscheduleTimeDetailService {
  private name = 'WorkscheduleTimeDetail';
  private workscheduleTimeDetailRepository: IWorkscheduleTimeDetailRepository;
  private workscheduleDetailRepository: IWorkscheduleDetailRepository;
  private workscheduleRepository: IWorkscheduleRepository;
  private logger: ILogger;
  private errorService: IErrorService;

  constructor(
    @inject(TYPES.WorkscheduleTimeDetailRepository)
    _workscheduleTimeDetailRepository: IWorkscheduleTimeDetailRepository,
    @inject(TYPES.WorkscheduleDetailRepository) _workscheduleDetailRepository: IWorkscheduleDetailRepository,
    @inject(TYPES.WorkscheduleRepository) _workscheduleRepository: IWorkscheduleRepository,
    @inject(TYPES.LoggerFactory) loggerFactory: (name: string) => ILogger,
    @inject(TYPES.ErrorService) _errorService: IErrorService
  ) {
    this.workscheduleTimeDetailRepository = _workscheduleTimeDetailRepository;
    this.workscheduleDetailRepository = _workscheduleDetailRepository;
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

  create = async (args: IWorkscheduleTimeDetailCreateInput) => {
    const operation = 'Create';
    const startTime = args.startTime;
    const endTime = args.endTime;
    const workschedule_detail_id = args.workschedule_detail_id;

    try {
      const startTime1 = moment(startTime);
      const endTime1 = moment(endTime);
      const duration = endTime1?.diff(startTime1, 'seconds');

      let workscheduleTimeDetail = await this.workscheduleTimeDetailRepository.create({
        startTime,
        endTime,
        duration,
        workschedule_detail_id,
      });

      let workscheduleDetail = await this.workscheduleDetailRepository.getById({ id: workschedule_detail_id });
      console.log(workscheduleDetail);

      /* Update payroll allocated hours on new workschedule created*/
      await this.updateWorkschedule({
        total: duration,
        workschedule_id: workscheduleDetail?.workschedule_id,
        type: 'add',
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
      let workscheduleDetail = await this.workscheduleDetailRepository.getById({
        id: workscheduleTimeDetail?.workschedule_detail_id,
      });
      console.log(workscheduleDetail);

      const startTime1 = moment(workscheduleTimeDetail?.startTime);
      const endTime1 = moment(workscheduleTimeDetail?.endTime);
      const duration = endTime1?.diff(startTime1, 'seconds');

      /* Update payroll allocated hours on new workschedule created*/
      await this.updateWorkschedule({
        total: duration,
        workschedule_id: workscheduleDetail?.workschedule_id,
        type: 'sub',
      });
      return workscheduleTimeDetail;
    } catch (err) {
      throw err;
    }
  };

  updateWorkschedule = async (args: any) => {
    const id = args.workschedule_id;
    const total = args.total;
    const type: string = args?.type;
    const workschedule: any = await this.workscheduleRepository.getById({ id: id });
    let payrollAllocatedHours;

    if (type === 'add') {
      payrollAllocatedHours = workschedule?.payrollAllocatedHours + total;
    } else {
      payrollAllocatedHours = workschedule?.payrollAllocatedHours - total;
    }
    const result = await this.workscheduleRepository.update({
      id,
      payrollAllocatedHours: payrollAllocatedHours,
    });
    return result;
  };
}
