import { injectable, inject } from 'inversify';

import Paging from '../utils/paging';
import { TYPES } from '../types';
import { IPagingArgs, IPaginationData } from '../interfaces/paging.interface';
import { IEntityRemove, IEntityID } from '../interfaces/common.interface';
import {
  IAttachedTimesheetCreateInput,
  IAttachedTimesheetRepository,
  IAttachedTimesheetService,
  IAttachedTimesheetUpdateInput,
} from '../interfaces/attached-timesheet.interface';
import AttachedTimesheet from '../entities/attached-timesheet.entity';
@injectable()
export default class AttachedTimesheetService implements IAttachedTimesheetService {
  private attachedTimesheetRepository: IAttachedTimesheetRepository;

  constructor(@inject(TYPES.AttachedTimesheetRepository) attachedTimesheetRepository: IAttachedTimesheetRepository) {
    this.attachedTimesheetRepository = attachedTimesheetRepository;
  }

  getAllAndCount = async (args: IPagingArgs): Promise<IPaginationData<AttachedTimesheet>> => {
    try {
      const { rows, count } = await this.attachedTimesheetRepository.getAllAndCount(args);

      const paging = Paging.getPagingResult({
        ...args,
        total: count,
      });

      return {
        paging,
        data: rows,
      };
    } catch (err) {
      throw err;
    }
  };

  create = async (args: IAttachedTimesheetCreateInput): Promise<AttachedTimesheet> => {
    try {
      const description = args.description;
      const attachment_id = args.attachment_id;
      const company_id = args.company_id;
      const created_by = args.created_by;
      const timesheet_id = args.timesheet_id;
      const invoice_id = args.invoice_id;
      const type = args.type;
      const amount = args.amount;
      const date = args.date;

      const attachedTimesheet = await this.attachedTimesheetRepository.create({
        description,
        attachment_id,
        company_id,
        created_by,
        timesheet_id,
        invoice_id,
        type,
        amount,
        date,
      });

      return attachedTimesheet;
    } catch (err) {
      throw err;
    }
  };

  update = async (args: IAttachedTimesheetUpdateInput): Promise<AttachedTimesheet> => {
    try {
      const id = args.id;
      const description = args?.description;
      const attachment_id = args?.attachment_id;
      const type = args.type;
      const amount = args.amount;
      const date = args.date;

      const AttachedTimesheet = await this.attachedTimesheetRepository.update({
        id,
        description,
        attachment_id,
        type,
        amount,
        date,
      });

      return AttachedTimesheet;
    } catch (err) {
      throw err;
    }
  };

  remove = async (args: IEntityRemove): Promise<AttachedTimesheet> => {
    try {
      const id = args.id;

      const AttachedTimesheet = await this.attachedTimesheetRepository.remove({
        id,
      });

      return AttachedTimesheet;
    } catch (err) {
      throw err;
    }
  };
}
