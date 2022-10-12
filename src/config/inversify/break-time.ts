import { ContainerModule, interfaces } from 'inversify';
import { TYPES } from '../../types';
import { IBreakTimeRepository } from '../../interfaces/break-time.interface';
import BreakTimeRepository from '../../repository/break-time.repository';

const breakTime = new ContainerModule((bind: interfaces.Bind, unbind: interfaces.Unbind) => {
  bind<IBreakTimeRepository>(TYPES.BreakTimeRepository).to(BreakTimeRepository);
});

export default breakTime;
