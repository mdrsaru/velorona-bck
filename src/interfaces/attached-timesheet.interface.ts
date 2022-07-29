import { IPagingArgs, IGetAllAndCountResult, IPaginationData, IGetOptions } from './paging.interface';
import { IEntityRemove, IEntityID, ISingleEntityQuery, ICountInput } from './common.interface';
import Media from '../entities/media.entity';
import AttachedTimesheet from '../entities/attached-timesheet.entity';
import Company from '../entities/company.entity';
import Timesheet from '../entities/timesheet.entity';
import { AttachedTimesheetStatus } from '../config/constants';

export interface IAttachedTimesheet {
  id: string;
  description: string;
  attachment_id: string;
  attachment: Media[];
  company_id: string;
  company: Company[];
  created_by: string;
  timesheet_id: string;
  invoice_id?: string;
  timesheet: Timesheet[];
}

export interface IAttachedTimesheetCreateInput {
  description?: IAttachedTimesheet['description'];
  attachment_id: string;
  company_id: IAttachedTimesheet['company_id'];
  created_by: IAttachedTimesheet['created_by'];
  timesheet_id: IAttachedTimesheet['timesheet_id'];
  invoice_id?: IAttachedTimesheet['invoice_id'];
}

export interface IAttachedTimesheetUpdateInput {
  id: string;
  description?: IAttachedTimesheet['description'];
  attachment_id?: string;
  status?: AttachedTimesheetStatus;
}

export interface IAttachedTimesheetCountInput extends ICountInput {}

export interface IUpdateWithInvoiceInput {
  timesheet_id: string;
  invoice_id: string;
}

export interface IAttachedTimesheetRepository {
  getAllAndCount(args: IPagingArgs): Promise<IGetAllAndCountResult<AttachedTimesheet>>;
  getAll(args: any): Promise<AttachedTimesheet[]>;
  getById(args: IEntityID): Promise<AttachedTimesheet | undefined>;
  create(args: IAttachedTimesheetCreateInput): Promise<AttachedTimesheet>;
  update(args: IAttachedTimesheetUpdateInput): Promise<AttachedTimesheet>;
  remove(args: IEntityRemove): Promise<AttachedTimesheet>;
  getBase64Attachments(args: any): Promise<any>;
  updateTimesheedAttachmentWithInvoice(args: IUpdateWithInvoiceInput): Promise<any>;
}

export interface IAttachedTimesheetService {
  getAllAndCount(args: IPagingArgs): Promise<IPaginationData<AttachedTimesheet>>;
  create(args: IAttachedTimesheetCreateInput): Promise<AttachedTimesheet>;
  update(args: IAttachedTimesheetUpdateInput): Promise<AttachedTimesheet>;
  remove(args: IEntityRemove): Promise<AttachedTimesheet>;
}
