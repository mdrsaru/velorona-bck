import { ContainerModule, interfaces } from 'inversify';

import { TYPES } from '../../types';

import {
  IWorkscheduleTimeDetailRepository,
  IWorkscheduleTimeDetailService,
} from '../../interfaces/workschedule-time-detail.interface';
import WorkscheduleTimeDetailRepository from '../../repository/workschedule-time-details.repository';
import { WorkscheduleTimeDetailResolver } from '../../graphql/resolvers/workschedule-time-detail.resolver';
import WorkscheduleTimeDetailService from '../../services/workschedule-time-detail.service';

const workscheduleTimeDetail = new ContainerModule((bind: interfaces.Bind, unbind: interfaces.Unbind) => {
  bind<IWorkscheduleTimeDetailRepository>(TYPES.WorkscheduleTimeDetailRepository).to(WorkscheduleTimeDetailRepository);
  bind<IWorkscheduleTimeDetailService>(TYPES.WorkscheduleTimeDetailService).to(WorkscheduleTimeDetailService);
  bind<WorkscheduleTimeDetailResolver>(WorkscheduleTimeDetailResolver)
    .to(WorkscheduleTimeDetailResolver)
    .inSingletonScope();
});

export default workscheduleTimeDetail;
