import { inject, injectable } from 'inversify';
import { isNil, isString, merge } from 'lodash';
import moment from 'moment';

import Timesheet from '../../entities/timesheet.entity';
import { IClientRepository } from '../../interfaces/client.interface';
import { ICompanyRepository } from '../../interfaces/company.interface';
import { IGetAllAndCountResult, IGetOptions, IPagingArgs } from '../../interfaces/paging.interface';
import { IEntityID, IEntityRemove } from '../../interfaces/common.interface';
import {
  ITimesheetCountInput,
  ITimesheetCreateInput,
  ITimesheetRepository,
  ITimesheetUpdateInput,
} from '../../interfaces/timesheet.interface';
import { IUserRepository } from '../../interfaces/user.interface';
import { TYPES } from '../../types';
import { ConflictError, NotFoundError, ValidationError } from '../../utils/api-error';

@injectable()
export default class TimesheetRepository implements ITimesheetRepository {
  constructor() {}

  getAllAndCount(args: IPagingArgs): Promise<IGetAllAndCountResult<Timesheet>> {
    throw new Error('not implemented');
  }

  getAll(args: IGetOptions): Promise<Timesheet[]> {
    throw new Error('not implemented');
  }

  getById(args: IEntityID): Promise<Timesheet | undefined> {
    throw new Error('not implemented');
  }

  create = async (args: ITimesheetCreateInput): Promise<Timesheet> => {
    throw new Error('not implemented');
  };

  update = async (args: ITimesheetUpdateInput): Promise<Timesheet> => {
    throw new Error('not implemented');
  };

  remove(args: IEntityRemove): Promise<Timesheet> {
    throw new Error('not implemented');
  }

  getTimesheetByManager = async (args: ITimesheetCountInput): Promise<IGetAllAndCountResult<Timesheet>> => {
    throw new Error('not implemented');
  };

  countTimesheet = async (args: ITimesheetCountInput): Promise<number> => {
    throw new Error('not implemented');
  };
}
