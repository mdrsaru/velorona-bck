import { injectable } from 'inversify';
import { find, findIndex, merge } from 'lodash';
import moment from 'moment';

import TimeEntry from '../../entities/time-entry.entity';

import { IEntityID, IEntityRemove } from '../../interfaces/common.interface';
import { IGetAllAndCountResult, IPagingArgs, IGetOptions } from '../../interfaces/paging.interface';
import {
  ITimeEntryCreateInput,
  ITimeEntryRepository,
  ITimeEntryUpdateInput,
  ITimeEntryWeeklyDetailsRepoInput,
  ITimeEntryActiveInput,
  ITimeEntryTotalDurationInput,
  IUserTotalExpenseInput,
  ITimeEntryBulkRemoveInput,
  IProjectItemInput,
  IProjectItem,
  IDurationMap,
  ITimeEntriesApproveRejectInput,
  IMarkApprovedTimeEntriesWithInvoice,
  ITimeEntryHourlyRateInput,
} from '../../interfaces/time-entry.interface';
import { timeEntries } from './data';
import { generateUuid } from './utils';

import * as apiError from '../../utils/api-error';
import strings from '../../config/strings';

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

  getActiveEntry = (args: ITimeEntryActiveInput): Promise<TimeEntry | undefined> => {
    const created_by = args.created_by;
    const company_id = args.company_id;

    const found = find(this.timeEntries, { created_by, company_id });

    return found;
  };

  getTotalTimeInSeconds = (args: ITimeEntryTotalDurationInput): Promise<number> => {
    throw new Error('not implemented');
  };

  getUserTotalExpense = (args: IUserTotalExpenseInput): Promise<number> => {
    throw new Error('not implemented');
  };

  getWeeklyDetails = (args: ITimeEntryWeeklyDetailsRepoInput): Promise<TimeEntry[]> => {
    throw new Error('not implemented');
  };

  create = (args: ITimeEntryCreateInput): Promise<TimeEntry> => {
    try {
      const timeEntry = new TimeEntry();

      timeEntry.id = generateUuid();
      timeEntry.startTime = args.startTime;
      timeEntry.clientLocation = args.clientLocation;
      timeEntry.project_id = args.project_id;
      timeEntry.company_id = args.company_id;
      timeEntry.created_by = args.created_by;
      timeEntry.createdAt = new Date();
      timeEntry.updatedAt = new Date();

      if (args.endTime) {
        timeEntry.endTime = args.endTime;

        let duration: undefined | number = undefined;
        const startDate = moment(args.startTime);
        const endDate = moment(args.endTime);
        duration = endDate.diff(startDate, 'seconds');
        timeEntry.duration = duration;
      }

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
        startTime: args.startTime,
        clientLocation: args.clientLocation,
        approver_id: args.approver_id,
        project_id: args.project_id,
        company_id: args.company_id,
        created_by: args.created_by,
      });

      if (args.endTime) {
        update.endTime = args.endTime;

        let duration: undefined | number = undefined;
        const startDate = moment(update.startTime);
        const endDate = moment(args.endTime);
        duration = endDate.diff(startDate, 'seconds');
        update.duration = duration;
      }

      this.timeEntries[foundIndex] = update;

      return Promise.resolve(update);
    } catch (err) {
      throw err;
    }
  };

  remove = (args: IEntityRemove): Promise<TimeEntry> => {
    throw new Error('not implemented');
  };

  bulkRemove = (args: ITimeEntryBulkRemoveInput): Promise<TimeEntry[]> => {
    throw new Error('not implemented');
  };

  getProjectItems = async (args: IProjectItemInput): Promise<IProjectItem[]> => {
    throw new Error('Not Implemented');
  };

  getDurationMap(args: IDurationMap): Promise<object> {
    throw new Error('Not Implemented');
  }

  approveRejectTimeEntries = async (args: ITimeEntriesApproveRejectInput): Promise<boolean> => {
    throw new Error('Not implemented');
  };

  markApprovedTimeEntriesWithInvoice = async (args: IMarkApprovedTimeEntriesWithInvoice): Promise<boolean> => {
    return true;
  };

  countEntities = (args: IGetOptions): Promise<number> => {
    return Promise.resolve(this.timeEntries?.length ?? 0);
  };

  updateHourlyRate = async (args: ITimeEntryHourlyRateInput): Promise<boolean> => {
    throw new Error('Not implemented');
  };
}
