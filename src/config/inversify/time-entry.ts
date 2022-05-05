import { ContainerModule, interfaces } from 'inversify';

import { TYPES } from '../../types';

import { ITimeEntryRepository, ITimeEntryService } from '../../interfaces/time-entry.interface';
import { TimeEntryResolver } from '../../graphql/resolvers/time-entry.resolver';
import TimeEntryRepository from '../../repository/time-entry.repository';
import TimeEntryService from '../../services/time-entry.service';

const timeEntry = new ContainerModule((bind: interfaces.Bind, unbind: interfaces.Unbind) => {
  bind<ITimeEntryRepository>(TYPES.TimeEntryRepository).to(TimeEntryRepository);
  bind<ITimeEntryService>(TYPES.TimeEntryService).to(TimeEntryService);
  bind<TimeEntryResolver>(TimeEntryResolver).to(TimeEntryResolver).inSingletonScope();
});

export default timeEntry;
