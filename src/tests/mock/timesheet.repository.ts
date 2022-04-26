import { injectable } from 'inversify';
import { find, findIndex, merge } from 'lodash';
import Timesheet from '../../entities/timesheet.entity';
import { IEntityID, IEntityRemove } from '../../interfaces/common.interface';
import { IGetAllAndCountResult, IPagingArgs } from '../../interfaces/paging.interface';
import {
  ITimesheetCreateInput,
  ITimesheetRepository,
  ITimesheetUpdateInput,
} from '../../interfaces/timesheet.interface';
import { timesheets } from './data';

import * as apiError from '../../utils/api-error';
import strings from '../../config/strings';

function generateUuid() {
  var dt = new Date().getTime();
  var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = (dt + Math.random() * 16) % 16 | 0;
    dt = Math.floor(dt / 16);
    return (c == 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
  return uuid;
}

@injectable()
export default class TimesheetRepository implements ITimesheetRepository {
  timesheets = timesheets;
  getAllAndCount = (args: IPagingArgs): Promise<IGetAllAndCountResult<Timesheet>> => {
    return Promise.resolve({
      count: this.timesheets.length,
      rows: this.timesheets as Timesheet[],
    });
  };
  getAll = (args: any): Promise<Timesheet[]> => {
    throw new Error('not implemented');
  };

  getById = (args: IEntityID): Promise<Timesheet | undefined> => {
    throw new Error('not implemented');
  };

  create = (args: ITimesheetCreateInput): Promise<Timesheet> => {
    try {
      const timesheet = new Timesheet();

      timesheet.id = generateUuid();
      timesheet.clientLocation = args.clientLocation;
      timesheet.project_id = args.project_id;
      timesheet.company_id = args.company_id;
      timesheet.created_by = args.created_by;
      timesheet.createdAt = new Date();
      timesheet.updatedAt = new Date();

      timesheets.push(timesheet);

      return Promise.resolve(timesheet);
    } catch (err) {
      throw err;
    }
  };

  update = (args: ITimesheetUpdateInput): Promise<Timesheet> => {
    try {
      const id = args.id;

      const foundIndex = findIndex(this.timesheets, { id });

      if (foundIndex < 0) {
        throw new apiError.NotFoundError({
          details: [strings.taskNotFound],
        });
      }
      const update = merge(this.timesheets[foundIndex], {
        clientLocation: args.clientLocation,
        approver_id: args.approver_id,
        project_id: args.project_id,
        company_id: args.company_id,
        created_by: args.created_by,
      });

      this.timesheets[foundIndex] = update;

      return Promise.resolve(update);
    } catch (err) {
      throw err;
    }
  };

  remove = (args: IEntityRemove): Promise<Timesheet> => {
    throw new Error('not implemented');
  };
}
