import { inject, injectable } from 'inversify';
import { EntityManager, getManager, getRepository } from 'typeorm';
import isNil from 'lodash/isNil';
import isString from 'lodash/isString';
import merge from 'lodash/merge';

import * as apiError from '../utils/api-error';
import { TYPES } from '../types';
import strings from '../config/strings';

import BaseRepository from './base.repository';

import { IUserRepository } from '../interfaces/user.interface';

import { isDate, isNumber, isArray } from 'lodash';
import WorkscheduleDetail from '../entities/workschedule-details.entity';
import { IWorkscheduleRepository } from '../interfaces/workschedule.interface';
import {
  IWorkscheduleDetailCreateInput,
  IWorkscheduleDetailRepository,
  IWorkscheduleDetailUpdateInput,
} from '../interfaces/workschedule-detail.interface';
import { workschedule, workscheduleTimeDetail } from '../config/db/columns';
import { entities } from '../config/constants';
import WorkscheduleTimeDetail from '../entities/workschedule-time-details.entity';

@injectable()
export default class WorkscheduleDetailRepository
  extends BaseRepository<WorkscheduleDetail>
  implements IWorkscheduleDetailRepository
{
  private manager: EntityManager;
  private userRepository: IUserRepository;
  private workscheduleRepository: IWorkscheduleRepository;
  constructor(
    @inject(TYPES.WorkscheduleRepository) _workscheduleRepository: IWorkscheduleRepository,
    @inject(TYPES.UserRepository) _userRepository: IUserRepository
  ) {
    super(getRepository(WorkscheduleDetail));
    this.userRepository = _userRepository;
    this.workscheduleRepository = _workscheduleRepository;
    this.manager = getManager();
  }

  create = async (args: IWorkscheduleDetailCreateInput): Promise<WorkscheduleDetail> => {
    try {
      const schedule_date = args.schedule_date;
      const workschedule_id = args.workschedule_id;
      const user_id = args.user_id;
      const startTime = args.startTime;
      const endTime = args.endTime;
      const duration = args.duration;

      const errors: string[] = [];

      if (errors.length) {
        throw new apiError.ValidationError({
          details: errors,
        });
      }

      const user = await this.userRepository.getById({ id: user_id });

      if (!user) {
        throw new apiError.NotFoundError({
          details: [strings.userNotFound],
        });
      }

      const workschedule = await this.workscheduleRepository.getById({ id: workschedule_id });
      if (!workschedule) {
        throw new apiError.NotFoundError({
          details: [strings.workscheduleNotFound],
        });
      }

      let result = await this.manager.transaction(async (entityManager) => {
        const workscheduleDetailRepo = entityManager.getRepository(WorkscheduleDetail);
        const workscheduleTimeDetailRepo = entityManager.getRepository(WorkscheduleTimeDetail);

        const workscheduleDetail = await workscheduleDetailRepo.save({
          schedule_date,
          workschedule_id,
          user_id,
          duration,
        });

        await workscheduleTimeDetailRepo.save({
          startTime,
          endTime,
          workschedule_detail_id: workscheduleDetail?.id,
          duration: duration,
        });
        return workscheduleDetail;
      });
      return result;
    } catch (err) {
      throw err;
    }
  };

  update = async (args: IWorkscheduleDetailUpdateInput): Promise<WorkscheduleDetail> => {
    try {
      const id = args.id;
      const schedule_date = args.schedule_date;
      const startTime = args.startTime;
      const endTime = args.endTime;
      const workschedule_id = args.workschedule_id;
      const user_id = args.user_id;
      const duration = args.duration;

      const found = await this.getById({ id });
      if (!found) {
        throw new apiError.NotFoundError({
          details: [strings.workscheduleDetailNotFound],
        });
      }

      const update = merge(found, {
        id,
        schedule_date,
        startTime,
        endTime,
        workschedule_id,
        user_id,
        duration,
      });

      let workscheduleDetail = await this.repo.save(update);

      return workscheduleDetail;
    } catch (err) {
      throw err;
    }
  };
}
