import { IPagingArgs, IGetAllAndCountResult, IPaginationData, IGetOptions } from './paging.interface';
import { IEntityRemove, IEntityID } from './common.interface';
import InvoiceSchedule from '../entities/invoice-schedule.entity';

export interface IInvoiceSchedule {
  id: string;
  scheduleDate: Date | string;
  timesheet_id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IInvoiceScheduleCreateInput {
  scheduleDate: IInvoiceSchedule['scheduleDate'];
  timesheet_id: IInvoiceSchedule['timesheet_id'];
}

export interface IInvoiceScheduleRepository {
  getAllAndCount(args: IPagingArgs): Promise<IGetAllAndCountResult<InvoiceSchedule>>;
  getAll(args: IGetOptions): Promise<InvoiceSchedule[]>;
  getById(args: IEntityID): Promise<InvoiceSchedule | undefined>;
  create(args: IInvoiceScheduleCreateInput): Promise<InvoiceSchedule>;
  remove(args: IEntityRemove): Promise<InvoiceSchedule>;
}
