import { TimeEntryApprovalStatus, EntryType } from '../config/constants';
import Company from '../entities/company.entity';
import Project from '../entities/project.entity';
import User from '../entities/user.entity';
import TimeEntry from '../entities/time-entry.entity';
import { IEntityID, IEntityRemove } from './common.interface';
import { IGetAllAndCountResult, IPaginationData, IPagingArgs, IGetOptions } from './paging.interface';
import BreakTime from '../entities/break-time.entity';

export interface ITimeEntry {
  id: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  breakTime?: number;
  startBreakTime?: Date;
  endBreakTime?: Date;
  clientLocation: string;
  approver_id: string;
  project_id: string;
  company_id: string;
  created_by: string;
  approver: User;
  project: Project;
  company: Company;
  creator: User;
  approvalStatus: TimeEntryApprovalStatus;
  hourlyRate: number;
  timesheet_id?: string;
  entryType?: EntryType;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITimeEntryCreateInput {
  startTime: ITimeEntry['startTime'];
  endTime?: ITimeEntry['endTime'];
  clientLocation: ITimeEntry['clientLocation'];
  project_id: ITimeEntry['project_id'];
  company_id: ITimeEntry['company_id'];
  created_by: ITimeEntry['created_by'];
  entryType: ITimeEntry['entryType'];
  description?: ITimeEntry['description'];
}

export interface ITimeEntryUpdateInput {
  id: ITimeEntry['id'];
  startTime?: ITimeEntry['startTime'];
  endTime?: ITimeEntry['endTime'];
  breakTime?: ITimeEntry['breakTime'];
  startBreakTime?: ITimeEntry['startBreakTime'];
  endBreakTime?: ITimeEntry['endBreakTime'];
  clientLocation?: ITimeEntry['clientLocation'];
  approver_id?: ITimeEntry['approver_id'];
  project_id?: ITimeEntry['project_id'];
  company_id?: ITimeEntry['company_id'];
  created_by?: ITimeEntry['created_by'];
  timesheet_id?: ITimeEntry['timesheet_id'];
  description?: ITimeEntry['description'];
}

export interface ITimeEntryStopInput {
  id: ITimeEntry['id'];
  endTime: ITimeEntry['endTime'];
}

export interface ITimeEntryWeeklyDetailsInput {
  timesheet_id?: string;
  company_id: string;
  created_by: string;
  startTime?: Date;
  endTime?: Date;
  client_id?: string;
}

export interface ITimeEntryWeeklyDetailsRepoInput {
  timesheet_id?: string;
  company_id: string;
  created_by: string;
  startTime: Date;
  endTime: Date;
  client_id?: string;
}

export interface ITimeEntryTotalDurationInput {
  company_id: string;
  user_id?: string;
  startTime: string;
  endTime: string;
  project_id?: string;
  invoiced?: boolean;
  timesheet_id?: string;
  client_id?: string;
}

/**
 * Total expense for invoiced/all_time_entries
 */
export interface IUserTotalExpenseInput {
  company_id: string;
  user_id: string;
  client_id: string;
  startTime: string;
  endTime: string;
  timesheet_id?: string;
  invoiced?: boolean;
}

export interface ITimeEntryActiveInput {
  created_by: string;
  company_id: string;
}

export interface ITimeEntryBulkRemoveInput {
  ids: string[];
  created_by: string;
  company_id: string;
  client_id: string;
}

export interface IProjectItem {
  project_id: string;
  projectName: string;
  totalDuration: number;
  hourlyRate: number;
  totalExpense: number;
  totalHours: number;
  timesheet_id?: any;
}

export interface IProjectItemInput {
  startTime: string;
  endTime: string;
  company_id: string;
  user_id: string;
  client_id: string;
  type?: string;
  status?: string;
}

export interface IDurationMap {
  timesheet_id: string;
  startTime: string;
  endTime: string;
  company_id: string;
  user_id: string;
  client_id: string;
}

export interface ITimeEntriesApproveRejectInput {
  ids: string[];
  approver_id: string;
  approvalStatus: ITimeEntry['approvalStatus'];
  timesheet_id?: string;
  reason?: string;
}

export interface ITimeEntryByStatusInvoiceInput {
  timesheet_id: string;
}

export interface IMarkApprovedTimeEntriesWithInvoice {
  timesheet_id: string;
  invoice_id: string;
}

export interface IPeriodicTimeEntriesInput {
  startDate: string;
  endDate: string;
  client_id: string;
  user_id: string;
  company_id: string;
}

export interface IMarkPeriodicApprovedTimeEntriesWithInvoice extends IPeriodicTimeEntriesInput {
  invoice_id: string;
}

export interface ITimeEntryPaginationData extends IPaginationData<TimeEntry> {
  activeEntry?: TimeEntry;
  activeBreakEntry?: BreakTime;
}

export interface IExpenseAndInvoicedDuration {
  timesheet_id: string;
  duration: number;
  expense: number;
}

export interface ITimeEntryHourlyRateInput {
  project_id: string;
  created_by: string;
  company_id: string;
  hourlyRate: number;
  hourlyInvoiceRate: number;
}

export interface ITotalDurationInput {
  company_id: string;
  user_id?: string;
  manager_id?: string;
}

export interface ITimeEntryUnlockInput {
  timesheet_id: string;
  company_id: string;
  user_id: string;
  statusToUnlock: TimeEntryApprovalStatus;
}

export interface ITimeEntryBulkUpdateInput {
  date: string;
  timesheet_id: string;
  duration: number;
  project_id: string;
}

export interface ITimeEntryBulkUpdateResult {
  updated: boolean;
  newEntryDetails?: {
    startTime: Date;
    endTime: Date;
    clientLocation: string;
    project_id: string;
    company_id: string;
    created_by: string;
    entryType: EntryType;
    description: string;
  };
}

export interface ITimeEntryRepository {
  getAllAndCount(args: IPagingArgs): Promise<IGetAllAndCountResult<TimeEntry>>;
  getAll(args: any): Promise<TimeEntry[]>;
  getById(args: IEntityID): Promise<TimeEntry | undefined>;
  /**
   * Get active time entry. i.e entry of user for which end_time is null
   */
  getActiveEntry(args: ITimeEntryActiveInput): Promise<TimeEntry | undefined>;
  /*
  Calculate total time in seconds of users time entry for the given interval
  */
  getTotalTimeInSeconds(args: ITimeEntryTotalDurationInput): Promise<number>;
  /**
   * Get user's total expense for the time entries related to all project for the given time interval
   */
  getUserTotalExpense(args: IUserTotalExpenseInput): Promise<number>;
  getWeeklyDetails(args: ITimeEntryWeeklyDetailsRepoInput): Promise<TimeEntry[]>;
  create(args: ITimeEntryCreateInput): Promise<TimeEntry>;
  update(args: ITimeEntryUpdateInput): Promise<TimeEntry>;
  remove(args: IEntityRemove): Promise<TimeEntry>;
  /*
  Removes multiple time entries of a user of particular client`
  */
  bulkRemove(args: ITimeEntryBulkRemoveInput): Promise<TimeEntry[]>;
  /**
   * Get projects with total expense, total hours and hourly rate of the time entries for the given time interval.
   */
  getProjectItems(args: IProjectItemInput): Promise<IProjectItem[]>;
  /**
   * Get day wise duration map of the time entries for given time interval
   */
  getDurationMap(args: IDurationMap): Promise<object>;
  /**
   * Approve/Reject entries by ids
   */
  approveRejectTimeEntries(args: ITimeEntriesApproveRejectInput): Promise<boolean>;
  markApprovedTimeEntriesWithInvoice(args: IMarkApprovedTimeEntriesWithInvoice): Promise<boolean>;
  /**
   * Mark the approved time entries within a provided interval with the invoice
   */
  markedPeriodicApprovedTimeEntriesWithInvoice(args: IMarkPeriodicApprovedTimeEntriesWithInvoice): Promise<boolean>;
  countEntities(args: IGetOptions): Promise<number>;
  /**
   * Update hourly rate of non invoiced entries
   */
  updateHourlyRate(args: ITimeEntryHourlyRateInput): Promise<boolean>;
  totalDuration(args: ITotalDurationInput): Promise<number>;
  unlockTimeEntries(args: ITimeEntryUnlockInput): Promise<boolean>;
  bulkUpdate(args: ITimeEntryBulkUpdateInput): Promise<ITimeEntryBulkUpdateResult>;
  /**
   * Get total expense and invoiced duration for the periodic time entries
   * Update the timesheets with the total expense and invoiced duration
   */
  updateExpenseAndInvoicedDuration(args: IPeriodicTimeEntriesInput): Promise<IExpenseAndInvoicedDuration[]>;
  /**
   * Check if there any approved time entries for which the invoice is to be generated
   */
  canGenerateInvoice(args: IPeriodicTimeEntriesInput): Promise<boolean>;
}

export interface ITimeEntryService {
  getAllAndCount(args: IPagingArgs): Promise<ITimeEntryPaginationData>;
  getWeeklyDetails(args: ITimeEntryWeeklyDetailsInput): Promise<TimeEntry[]>;
  create(args: ITimeEntryCreateInput): Promise<TimeEntry>;
  update(args: ITimeEntryUpdateInput): Promise<TimeEntry>;
  remove(args: IEntityRemove): Promise<TimeEntry>;
  bulkRemove(args: ITimeEntryBulkRemoveInput): Promise<TimeEntry[]>;
  approveRejectTimeEntries(args: ITimeEntriesApproveRejectInput): Promise<boolean>;
  bulkUpdate(args: ITimeEntryBulkUpdateInput): Promise<boolean>;
}
