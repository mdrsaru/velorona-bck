import container from '../../inversify.config';
import { TYPES } from '../../types';
import { IWorkscheduleRepository } from '../../interfaces/workschedule.interface';
import Workschedule from '../../entities/workschedule.entity';

import Dataloader from 'dataloader';

const batchWorkschedulesByIdFn = async (ids: readonly string[]) => {
  const workscheduleRepo: IWorkscheduleRepository = container.get(TYPES.WorkscheduleRepository);
  const query = { id: ids };
  const workschedules: Workschedule[] = await workscheduleRepo.getAll({ query });
  const workscheduleObj: any = {};

  workschedules.forEach((workschedule: Workschedule) => {
    workscheduleObj[workschedule.id] = workschedule;
  });

  return ids.map((id) => workscheduleObj[id]);
};

export const workschedulesByIdLoader = () => new Dataloader(batchWorkschedulesByIdFn);
