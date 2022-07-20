import { injectable } from 'inversify';
import { getRepository } from 'typeorm';
import WorkscheduleTimeDetail from '../entities/workschedule-time-details.entity';
import {
  IWorkscheduleTimeDetailCreateInput,
  IWorkscheduleTimeDetailRepository,
  IWorkscheduleTimeDetailTotalDurationInput,
  IWorkscheduleTimeDetailUpdateInput,
} from '../interfaces/workschedule-time-detail.interface';
import BaseRepository from './base.repository';

import * as apiError from '../utils/api-error';
import strings from '../config/strings';
import { isEmpty, isNil, merge } from 'lodash';
import { ITimeEntryTotalDurationInput } from '../interfaces/time-entry.interface';
import { entities } from '../config/constants';

@injectable()
export default class WorkscheduleTimeDetailRepository
  extends BaseRepository<WorkscheduleTimeDetail>
  implements IWorkscheduleTimeDetailRepository
{
  constructor() {
    super(getRepository(WorkscheduleTimeDetail));
  }

  create = async (args: IWorkscheduleTimeDetailCreateInput): Promise<WorkscheduleTimeDetail> => {
    try {
      const startTime = args.startTime;
      const endTime = args.endTime;
      const duration = args.duration;
      const workschedule_detail_id = args.workschedule_detail_id;
      const errors: string[] = [];

      const workscheduleTimeDetail = await this.repo.save({
        startTime,
        endTime,
        duration,
        workschedule_detail_id,
      });

      return workscheduleTimeDetail;
    } catch (err) {
      throw err;
    }
  };
  update = async (args: IWorkscheduleTimeDetailUpdateInput): Promise<WorkscheduleTimeDetail> => {
    try {
      const id = args.id;
      const startTime = args.startTime;
      const endTime = args.endTime;
      const workschedule_detail_id = args.workschedule_detail_id;
      const duration = args.duration;

      const found = await this.getById({ id });
      if (!found) {
        throw new apiError.NotFoundError({
          details: ['Workschedule Time Detail not found'],
        });
      }
      const update = merge(found, {
        id,
        startTime,
        workschedule_detail_id,
        endTime,
        duration,
      });

      let workscheduleTimeDetail = await this.repo.save(update);

      return workscheduleTimeDetail;
    } catch (err) {
      throw err;
    }
  };

  getTotalTimeInSeconds = async (args: IWorkscheduleTimeDetailTotalDurationInput): Promise<number> => {
    try {
      const startTime = args.startTime;
      const endTime = args.endTime;
      const workschedule_detail_id = args.workschedule_detail_id;
      const errors: string[] = [];

      if (isNil(startTime) || isEmpty(startTime)) {
        errors.push(strings.startDateRequired);
      }
      if (isNil(endTime) || isEmpty(endTime)) {
        errors.push(strings.endDateRequired);
      }

      const query = this.repo
        .createQueryBuilder(entities.workscheduleTimeDetail)
        .select('SUM(duration)', 'totalTime')
        .andWhere('start_time >= :startTime', { startTime })
        .andWhere('start_time <= :endTime', { endTime });

      if (workschedule_detail_id) {
        query.andWhere('workschedule_detail_id = :workschedule_detail_id', { workschedule_detail_id });
      }
      const { totalTime } = await query.getRawOne();

      return totalTime ?? 0;
    } catch (err) {
      throw err;
    }
  };
}
