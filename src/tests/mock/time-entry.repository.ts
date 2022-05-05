import { injectable } from 'inversify';
import { find, findIndex, merge } from 'lodash';
import TimeEntry from '../../entities/time-entry.entity';
import { IEntityID, IEntityRemove } from '../../interfaces/common.interface';
import { IGetAllAndCountResult, IPagingArgs } from '../../interfaces/paging.interface';
import {
  ITimeEntryCreateInput,
  ITimeEntryRepository,
  ITimeEntryUpdateInput,
  ITimeEntryWeeklyDetailsRepoInput,
} from '../../interfaces/time-entry.interface';
import { timeEntries } from './data';

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
export default class TimeEntryRepository implements ITimeEntryRepository {
  timeEntries = timeEntries;
  getAllAndCount = (args: IPagingArgs): Promise<IGetAllAndCountResult<TimeEntry>> => {
    return Promise.resolve({
      count: this.timeEntries.length,
      rows: this.timeEntries as TimeEntry[],
    });
  };
  getAll = (args: any): Promise<TimeEntry[]> => {
    throw new Error('not implemented');
  };

  getById = (args: IEntityID): Promise<TimeEntry | undefined> => {
    throw new Error('not implemented');
  };

  getWeeklyDetails = (args: ITimeEntryWeeklyDetailsRepoInput): Promise<TimeEntry[]> => {
    throw new Error('not implemented');
  };

  create = (args: ITimeEntryCreateInput): Promise<TimeEntry> => {
    try {
      const timeEntry = new TimeEntry();

      timeEntry.id = generateUuid();
      timeEntry.clientLocation = args.clientLocation;
      timeEntry.project_id = args.project_id;
      timeEntry.company_id = args.company_id;
      timeEntry.created_by = args.created_by;
      timeEntry.createdAt = new Date();
      timeEntry.updatedAt = new Date();

      timeEntries.push(timeEntry);

      return Promise.resolve(timeEntry);
    } catch (err) {
      throw err;
    }
  };

  update = (args: ITimeEntryUpdateInput): Promise<TimeEntry> => {
    try {
      const id = args.id;

      const foundIndex = findIndex(this.timeEntries, { id });

      if (foundIndex < 0) {
        throw new apiError.NotFoundError({
          details: [strings.taskNotFound],
        });
      }
      const update = merge(this.timeEntries[foundIndex], {
        clientLocation: args.clientLocation,
        approver_id: args.approver_id,
        project_id: args.project_id,
        company_id: args.company_id,
        created_by: args.created_by,
      });

      this.timeEntries[foundIndex] = update;

      return Promise.resolve(update);
    } catch (err) {
      throw err;
    }
  };

  remove = (args: IEntityRemove): Promise<TimeEntry> => {
    throw new Error('not implemented');
  };
}
