import { isNil, isString } from 'lodash';
import strings from '../config/strings';
import { IActivityLogCreateInput, IActivityLogRepository } from '../interfaces/activityLog.interface';
import ActivityLog from '../entities/activity-log.entity';

import * as apiError from '../utils/api-error';
import { inject, injectable } from 'inversify';
import BaseRepository from './base.repository';
import { TYPES } from '../types';
import { getRepository } from 'typeorm';
import { company } from '../config/db/columns';

@injectable()
export default class ActivityLogRepository extends BaseRepository<ActivityLog> implements IActivityLogRepository {
  constructor() {
    super(getRepository(ActivityLog));
  }

  create = async (args: IActivityLogCreateInput): Promise<ActivityLog> => {
    try {
      const type = args.type;
      const message = args.message;
      const company_id = args.company_id;
      const user_id = args.user_id;

      const errors: string[] = [];

      if (isNil(message) || !isString(message)) {
        errors.push(strings.messageRequired);
      }

      if (isNil(user_id) || !isString(user_id)) {
        errors.push(strings.userIdRequired);
      }
      if (errors.length) {
        throw new apiError.ValidationError({
          details: errors,
        });
      }

      const activityLog = await this.repo.save({
        type,
        message,
        company_id,
        user_id,
      });

      return activityLog;
    } catch (err) {
      throw err;
    }
  };
}
