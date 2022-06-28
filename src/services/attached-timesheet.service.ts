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
      const date = args.date;
      const totalCost = args.totalCost;
      const attachment_id = args.attachment_id;
      const company_id = args.company_id;

      const AttachedTimesheet = await this.attachedTimesheetRepository.create({
        description,
        totalCost,
        date,
        attachment_id,
        company_id,
      });

      return AttachedTimesheet;
    } catch (err) {
      throw err;
    }
  };

  update = async (args: IAttachedTimesheetUpdateInput): Promise<AttachedTimesheet> => {
    try {
      const id = args.id;
      const description = args?.description;
      const date = args?.date;
      const totalCost = args?.totalCost;
      const attachment_id = args?.attachment_id;

      const AttachedTimesheet = await this.attachedTimesheetRepository.update({
        id,
        description,
        totalCost,
        date,
        attachment_id,
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
