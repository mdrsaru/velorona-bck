import { inject, injectable } from 'inversify';

import { TYPES } from '../types';
import Paging from '../utils/paging';

import { IPaginationData, IPagingArgs } from '../interfaces/paging.interface';
import { IEntityID, IEntityRemove, IErrorService, ILogger } from '../interfaces/common.interface';
import {
  IWorkscheduleDetailBulkRemoveInput,
  IWorkscheduleDetailCopyInput,
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
import _ from 'lodash';
import workscheduleTimeDetail from '../config/inversify/workschedule-time-detail';
import { NotFoundError } from '../utils/api-error';

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

  bulkRemove = async (args: IWorkscheduleDetailBulkRemoveInput) => {
    try {
      const ids = args.ids;
      const user_id = args.user_id;
      const workschedule_id = args.workschedule_id;

      const workscheduleDetail = await this.workscheduleDetailRepository.bulkRemove({
        ids,
        user_id,
        workschedule_id,
      });

      let startDateObj: any = {};
      workscheduleDetail.forEach((workscheduleDetail) => {
        const startDate = moment(workscheduleDetail.schedule_date).startOf('isoWeek').format('YYYY-MM-DD');
        startDateObj[startDate] = true;
      });
      try {
        Object.keys(startDateObj).forEach(async (date) => {
          await this.updateWorkschedule({
            startTime: new Date(date),
            id: workschedule_id,
          });
        });
      } catch (err) {
        this.logger.error({
          operation: 'updateWorkschedule',
          message: 'Error updating Workschedule while bulk delete',
          data: err,
        });
      }
      return workscheduleDetail;
    } catch (err) {
      throw err;
    }
  };

  getWeekDays = (date: string | Date): any => {
    const dates: any = [];
    const current = moment(date);

    for (let i = 0; i < 7; i++) {
      dates.push(new Date(current.format('YYYY-MM-DD')));
      current.add(1, 'days');
    }
    return dates;
  };

  dateDifference = async (Date1: any, Date2: any) => {
    const date1: any = new Date(Date1);
    const date2: any = new Date(Date2);
    const diffTime = Math.abs(date2 - date1);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  bulkCreate = async (args: IWorkscheduleDetailCopyInput) => {
    const operation = 'create';
    const given_schedule_date: any = args.schedule_date;
    const workscheduleId = args.workschedule_id;
    const copy_workschedule_id = args.copy_workschedule_id;
    const user_id = args.user_id;
    try {
      let workscheduleDetails = await this.workscheduleDetailRepository.getAll({
        query: {
          workschedule_id: copy_workschedule_id,
          user_id,
        },
        relations: ['WorkscheduleTimeDetail'],
      });
      let res;

      if (!workscheduleDetails?.length) {
        throw new NotFoundError({ details: ['Workschedule of this user in selected date not found'] });
      } else {
        let diffDays = await this.dateDifference(given_schedule_date, workscheduleDetails?.[0]?.schedule_date);
        workscheduleDetails.map(async (workscheduleDetail, index) => {
          let schedule_date = new Date(
            workscheduleDetail?.schedule_date.setDate(workscheduleDetail?.schedule_date.getDate() + diffDays)
          );
          let workschedule_id = workscheduleId;
          let duration = workscheduleDetail?.duration;
          let user_id = workscheduleDetail.user_id;

          let res = await this.workscheduleDetailRepository.bulkCreate({
            schedule_date,
            workschedule_id,
            user_id,
            duration: duration,
            workscheduleTimeDetail: workscheduleDetail.WorkscheduleTimeDetail,
          });

          await this.updateWorkschedule({
            startTime: given_schedule_date,
            workschedule_id: workscheduleId,
          });
          return res;
        });
      }

      return res;
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
