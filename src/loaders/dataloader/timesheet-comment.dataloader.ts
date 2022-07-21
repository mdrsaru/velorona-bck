import Dataloader from 'dataloader';

import Media from '../../entities/media.entity';
import { ITimesheetCommentRepository } from '../../interfaces/timesheet-comment.interface';
import { IMediaRepository } from '../../interfaces/media.interface';
import container from '../../inversify.config';
import { TYPES } from '../../types';

const batchReplyCountByParentIdFn = async (ids: readonly string[]) => {
  const timesheetCommentRepository: ITimesheetCommentRepository = container.get(TYPES.TimesheetCommentRepository);
  const timesheetCommentObj: any = {};

  const replyCount = await timesheetCommentRepository.countReplies([...ids]);
  const replyCountObj: { [id: string]: number } = {};

  replyCount.forEach((reply: any) => {
    replyCountObj[reply.reply_id] = reply.count;
  });

  return ids.map((id) => replyCountObj[id] ?? 0);
};

export const replyCountByParentIdLoader = () => new Dataloader(batchReplyCountByParentIdFn);
