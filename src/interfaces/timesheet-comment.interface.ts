import { IPagingArgs, IGetAllAndCountResult, IPaginationData, IGetOptions } from './paging.interface';
import { IEntityRemove, IEntityID, ISingleEntityQuery, ICountInput } from './common.interface';
import TimesheetComment from '../entities/timesheet-comment.entity';

export interface ITimesheetComment {
  id: string;
  comment: string;
  user_id: string;
  timesheet_id: string;
  reply_id?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ITimesheetCommentCreateInput {
  comment: ITimesheetComment['comment'];
  timesheet_id: ITimesheetComment['timesheet_id'];
  user_id: ITimesheetComment['user_id'];
  reply_id?: ITimesheetComment['reply_id'];
}

export interface ITimesheetCommentUpdateInput {
  id: ITimesheetComment['id'];
  comment: ITimesheetComment['comment'];
}

export interface ITimesheetCommentReplyCount {
  id: string;
  count: number;
}

export interface ITimesheetCommentRepository {
  getAllAndCount(args: IPagingArgs): Promise<IGetAllAndCountResult<TimesheetComment>>;
  getAll(args: any): Promise<TimesheetComment[]>;
  getSingleEntity(args: ISingleEntityQuery): Promise<TimesheetComment | undefined>;
  countEntities(args: IGetOptions): Promise<number>;
  getById(args: IEntityID): Promise<TimesheetComment | undefined>;
  create(args: ITimesheetCommentCreateInput): Promise<TimesheetComment>;
  update(args: ITimesheetCommentUpdateInput): Promise<TimesheetComment>;
  remove(args: IEntityRemove): Promise<TimesheetComment>;
  /**
   * @param {string[]} - parent ids
   */
  countReplies(ids: string[]): Promise<ITimesheetCommentReplyCount[]>;
}

export interface ITimesheetCommentService {
  getAllAndCount(args: IPagingArgs): Promise<IPaginationData<TimesheetComment>>;
  create(args: ITimesheetCommentCreateInput): Promise<TimesheetComment>;
  update(args: ITimesheetCommentUpdateInput): Promise<TimesheetComment>;
  remove(args: IEntityRemove): Promise<TimesheetComment>;
}
