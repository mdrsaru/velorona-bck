import Dataloader from 'dataloader';

import Media from '../../entities/media.entity';
import { ITaskRepository } from '../../interfaces/task.interface';
import { IMediaRepository } from '../../interfaces/media.interface';
import container from '../../inversify.config';
import { TYPES } from '../../types';

const batchUsersByTaskIdFn = async (ids: readonly string[]) => {
  const taskRepository: ITaskRepository = container.get(TYPES.TaskRepository);
  const taskObj: any = {};
  let query = { id: ids };
  const tasks = await taskRepository.getAll({ query, relations: ['users'] });
  tasks.forEach((task: any) => {
    taskObj[task.id] = task.users;
  });

  return ids.map((id) => taskObj[id]);
};

const batchAttachmentByTaskIdFn = async (ids: readonly string[]) => {
  const mediaRepository: IMediaRepository = container.get(TYPES.MediaRepository);
  const taskObj: { [id: string]: Media[] } = {};

  const attachments = await mediaRepository.getMediaByTaskIds([...ids]);
  attachments.forEach((attachment) => {
    // checking for length as each media should be associated with only one task
    if (attachment?.tasks?.length === 1) {
      const taskId = attachment.tasks[0].id;

      if (taskId in taskObj) {
        taskObj[taskId].push(attachment);
      } else {
        taskObj[taskId] = [attachment];
      }
    }
  });

  return ids.map((id) => taskObj[id] ?? []);
};

export const usersByTaskIdLoader = () => new Dataloader(batchUsersByTaskIdFn);
export const attachmentsByTaskIdLoader = () => new Dataloader(batchAttachmentByTaskIdFn);
