import container from '../../inversify.config';
import { TYPES } from '../../types';

import Dataloader from 'dataloader';
import { IWorkscheduleTimeDetailRepository } from '../../interfaces/workschedule-time-detail.interface';
import WorkscheduleTimeDetail from '../../entities/workschedule-time-details.entity';

const batchWorkschedulesTimeDetailByIdFn = async (ids: readonly string[]) => {
  const workscheduleTimeDetailRepo: IWorkscheduleTimeDetailRepository = container.get(
    TYPES.WorkscheduleTimeDetailRepository
  );
  const query = { workschedule_detail_id: ids };
  const workscheduleTimeDetails: WorkscheduleTimeDetail[] = await workscheduleTimeDetailRepo.getAll({ query });

  const workscheduleTimeDetailObj: any = {};

  workscheduleTimeDetails.forEach((workscheduleTimeDetail: WorkscheduleTimeDetail) => {
    if (workscheduleTimeDetail.workschedule_detail_id in workscheduleTimeDetailObj) {
      workscheduleTimeDetailObj[workscheduleTimeDetail.workschedule_detail_id].push(workscheduleTimeDetail);
    } else {
      workscheduleTimeDetailObj[workscheduleTimeDetail.workschedule_detail_id] = [workscheduleTimeDetail];
    }
  });
  return ids.map((id) => workscheduleTimeDetailObj[id]);
};

export const workschedulesTimeDetailByIdLoader = () => new Dataloader(batchWorkschedulesTimeDetailByIdFn);
