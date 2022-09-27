import Dataloader from 'dataloader';

import { ITimeEntryRepository } from '../../interfaces/time-entry.interface';
import container from '../../inversify.config';
import { TYPES } from '../../types';
import BreakTime from '../../entities/break-time.entity';
import TimeEntry from '../../entities/time-entry.entity';

const batchBreakTimeByTimeEntryIdFn = async (ids: readonly string[]) => {
  const timeEntryRepo: ITimeEntryRepository = container.get(TYPES.TimeEntryRepository);
  const query = { id: ids };
  const timeEntries = await timeEntryRepo.getAll({ query, relations: ['breakTime'] });

  const timeEntryObj: { [timeEntryId: string]: BreakTime[] } = {};

  timeEntries.forEach((timeEntry: TimeEntry) => {
    timeEntryObj[timeEntry.id] = timeEntry.breakTime ?? [];
  });
  return ids.map((timeEntryId: string) => timeEntryObj[timeEntryId] ?? []);
};

export const breakTimesByTimeEntryIdLoader = () => new Dataloader(batchBreakTimeByTimeEntryIdFn);
