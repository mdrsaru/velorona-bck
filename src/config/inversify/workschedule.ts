import { ContainerModule, interfaces } from 'inversify';

import { WorkscheduleResolver } from '../../graphql/resolvers/workschedule.resolver';
import WorkscheduleService from '../../services/workschedule.service';
import WorkscheduleRepository from '../../repository/workschedule.repository';

import { TYPES } from '../../types';

import { IWorkscheduleRepository, IWorkscheduleService } from '../../interfaces/workschedule.interface';

const workschedule = new ContainerModule((bind: interfaces.Bind, unbind: interfaces.Unbind) => {
  bind<IWorkscheduleRepository>(TYPES.WorkscheduleRepository).to(WorkscheduleRepository);
  bind<IWorkscheduleService>(TYPES.WorkscheduleService).to(WorkscheduleService);
  bind<WorkscheduleResolver>(WorkscheduleResolver).to(WorkscheduleResolver).inSingletonScope();
});

export default workschedule;
