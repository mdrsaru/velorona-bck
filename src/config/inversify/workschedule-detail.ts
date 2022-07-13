import { ContainerModule, interfaces } from 'inversify';

import { TYPES } from '../../types';

import {
  IWorkscheduleDetailRepository,
  IWorkscheduleDetailService,
} from '../../interfaces/workschedule-detail.interface';
import { WorkscheduleDetailResolver } from '../../graphql/resolvers/workschedule-details.resolver';
import WorkscheduleDetailService from '../../services/workschedule-detail.service';
import WorkscheduleDetailRepository from '../../repository/workschedule-detail.repository';

const workscheduleDetail = new ContainerModule((bind: interfaces.Bind, unbind: interfaces.Unbind) => {
  bind<IWorkscheduleDetailRepository>(TYPES.WorkscheduleDetailRepository).to(WorkscheduleDetailRepository);
  bind<IWorkscheduleDetailService>(TYPES.WorkscheduleDetailService).to(WorkscheduleDetailService);
  bind<WorkscheduleDetailResolver>(WorkscheduleDetailResolver).to(WorkscheduleDetailResolver).inSingletonScope();
});

export default workscheduleDetail;
