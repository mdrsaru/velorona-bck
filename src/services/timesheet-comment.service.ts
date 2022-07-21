import { injectable, inject } from 'inversify';

import TimesheetComment from '../entities/timesheet-comment.entity';
import Paging from '../utils/paging';
import { TYPES } from '../types';

import { IPagingArgs, IPaginationData } from '../interfaces/paging.interface';
import { IEntityRemove, IEntityID } from '../interfaces/common.interface';
import {
  ITimesheetCommentCreateInput,
  ITimesheetCommentUpdateInput,
  ITimesheetCommentRepository,
  ITimesheetCommentService,
} from '../interfaces/timesheet-comment.interface';

@injectable()
export default class TimesheetCommentService implements ITimesheetCommentService {
  private timesheetCommentRepository: ITimesheetCommentRepository;

  constructor(@inject(TYPES.TimesheetCommentRepository) timesheetCommentRepository: ITimesheetCommentRepository) {
    this.timesheetCommentRepository = timesheetCommentRepository;
  }

  getAllAndCount = async (args: IPagingArgs): Promise<IPaginationData<TimesheetComment>> => {
    try {
      if (args.query.company_id) {
        delete args.query.company_id;
      }
      const { rows, count } = await this.timesheetCommentRepository.getAllAndCount(args);

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

  create = async (args: ITimesheetCommentCreateInput): Promise<TimesheetComment> => {
    try {
      const comment = args.comment;
      const user_id = args.user_id;
      const reply_id = args.reply_id;
      const timesheet_id = args.timesheet_id;

      const timesheetComment = await this.timesheetCommentRepository.create({
        comment,
        user_id,
        reply_id,
        timesheet_id,
      });

      return timesheetComment;
    } catch (err) {
      throw err;
    }
  };

  update = async (args: ITimesheetCommentUpdateInput): Promise<TimesheetComment> => {
    try {
      const id = args.id;
      const comment = args.comment;

      const timesheetComment = await this.timesheetCommentRepository.update({
        id,
        comment,
      });

      return timesheetComment;
    } catch (err) {
      throw err;
    }
  };

  remove = async (args: IEntityRemove): Promise<TimesheetComment> => {
    try {
      const id = args.id;

      const timesheetComment = await this.timesheetCommentRepository.remove({
        id,
      });

      return timesheetComment;
    } catch (err) {
      throw err;
    }
  };
}
