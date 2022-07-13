import { injectable } from 'inversify';
import { getRepository } from 'typeorm';
import WorkscheduleTimeDetail from '../entities/workschedule-time-details.entity';
import {
  IWorkscheduleTimeDetailCreateInput,
  IWorkscheduleTimeDetailRepository,
  IWorkscheduleTimeDetailUpdateInput,
} from '../interfaces/workschedule-time-detail.interface';
import BaseRepository from './base.repository';

import * as apiError from '../utils/api-error';
import strings from '../config/strings';
import { merge } from 'lodash';

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
      console.log(args, 'timeDetail');

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
      });

      let workscheduleTimeDetail = await this.repo.save(update);

      return workscheduleTimeDetail;
    } catch (err) {
      throw err;
    }
  };
}
