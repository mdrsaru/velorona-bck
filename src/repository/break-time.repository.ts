import { inject, injectable } from 'inversify';
import BaseRepository from './base.repository';
import BreakTime from '../entities/break-time.entity';
import {
  IBreakActiveInput,
  IBreakTimeCreateInput,
  IBreakTimeRepository,
  IBreakTimeUpdateInput,
} from '../interfaces/break-time.interface';
import { TYPES } from '../types';
import * as apiError from '../utils/api-error';

import { getRepository, IsNull } from 'typeorm';
import { merge } from 'lodash';
import strings from '../config/strings';

@injectable()
export default class BreakTimeRepository extends BaseRepository<BreakTime> implements IBreakTimeRepository {
  constructor() {
    super(getRepository(BreakTime));
  }

  create = async (args: IBreakTimeCreateInput): Promise<BreakTime> => {
    try {
      const startTime = args.startTime;
      const endTime = args.endTime;
      const time_entry_id = args.time_entry_id;

      const errors: string[] = [];

      const activeBreakTimeCount = await this.repo.count({
        time_entry_id,
        endTime: IsNull(),
      });

      if (activeBreakTimeCount) {
        throw new apiError.ValidationError({
          details: [strings.activeTimerNotStopped],
        });
      }
      const entities = await this.repo.save({
        startTime,
        endTime,
        time_entry_id,
      });

      return entities;
    } catch (err) {
      throw err;
    }
  };

  update = async (args: IBreakTimeUpdateInput): Promise<BreakTime> => {
    try {
      const id = args.id;
      const startTime = args.startTime;
      const endTime = args.endTime;
      const time_entry_id = args.time_entry_id;
      const duration = args.duration;

      const found = await this.getById({ id });
      if (!found) {
        throw new apiError.NotFoundError({
          details: ['Break Time not found'],
        });
      }
      const update = merge(found, {
        id,
        startTime,
        endTime,
        duration,
        time_entry_id,
      });

      let breakTimeDetail = await this.repo.save(update);

      return breakTimeDetail;
    } catch (err) {
      throw err;
    }
  };

  getActiveBreak = async (args: IBreakActiveInput): Promise<BreakTime | undefined> => {
    try {
      const time_entry_id = args.time_entry_id;
      console.log(time_entry_id);
      const timeEntry = await this.repo.findOne({
        endTime: IsNull(),
        time_entry_id,
      });
      console.log(timeEntry, '\n  n activeBreak');
      return timeEntry;
    } catch (err) {
      throw err;
    }
  };
}
