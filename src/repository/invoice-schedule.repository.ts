import { injectable, inject } from 'inversify';
import { getRepository } from 'typeorm';

import { TYPES } from '../types';
import strings from '../config/strings';
import InvoiceSchedule from '../entities/invoice-schedule.entity';
import BaseRepository from './base.repository';
import * as apiError from '../utils/api-error';

import {
  IInvoiceSchedule,
  IInvoiceScheduleCreateInput,
  IInvoiceScheduleRepository,
} from '../interfaces/invoice-schedule.interface';
import { IGetAllAndCountResult, IGetOptions } from '../interfaces/paging.interface';

@injectable()
export default class InvoiceScheduleRepository
  extends BaseRepository<InvoiceSchedule>
  implements IInvoiceScheduleRepository
{
  constructor() {
    super(getRepository(InvoiceSchedule));
  }

  create = async (args: IInvoiceScheduleCreateInput): Promise<InvoiceSchedule> => {
    try {
      const scheduleDate = args.scheduleDate;
      const timesheet_id = args.timesheet_id;

      const errors: string[] = [];

      if (!scheduleDate) {
        errors.push(strings.dateRequired);
      }
      if (!timesheet_id) {
        errors.push(strings.timesheetIdRequired);
      }

      if (errors.length) {
        throw new apiError.ValidationError({
          details: errors,
        });
      }

      const invoiceSchedule = await this.repo.save({
        scheduleDate,
        timesheet_id,
      });

      return invoiceSchedule;
    } catch (err) {
      throw err;
    }
  };
}
