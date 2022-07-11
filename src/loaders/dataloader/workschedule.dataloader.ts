import container from '../../inversify.config';
import { TYPES } from '../../types';
import { IWorkscheduleRepository } from '../../interfaces/workschedule.interface';
import Workschedule from '../../entities/workschedule.entity';

import Dataloader from 'dataloader';

const batchWorkschedulesByIdFn = async (ids: readonly string[]) => {
  const workscheduleRepo: IWorkscheduleRepository = container.get(TYPES.WorkscheduleRepository);
  const query = { id: ids };
  console.log(query);
  const workschedules: Workschedule[] = await workscheduleRepo.getAll({ query });
  console.log(workschedules);
  const workscheduleObj: any = {};

  workschedules.forEach((workschedule: Workschedule) => {
    workscheduleObj[workschedule.id] = workschedule;
  });
  console.log(workscheduleObj);

  return ids.map((id) => workscheduleObj[id]);
};

export const workschedulesByIdLoader = () => new Dataloader(batchWorkschedulesByIdFn);
