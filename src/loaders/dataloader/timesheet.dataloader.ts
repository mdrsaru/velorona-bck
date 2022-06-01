import Dataloader from 'dataloader';

import { TYPES } from '../../types';
import container from '../../inversify.config';
import { ITimesheetRepository } from '../../interfaces/timesheet.interface';
import Timesheet from '../../entities/timesheet.entity';

const batchTimesheetByIdFn = async (ids: readonly string[]) => {
  const timesheetRepo: ITimesheetRepository = container.get(TYPES.TimesheetRepository);
  const query = { id: ids };
  const timesheet = await timesheetRepo.getAll({ query });
  const timesheetObj: { [id: string]: Timesheet } = {};

  timesheet.forEach((timesheet: any) => {
    timesheetObj[timesheet.id] = timesheet;
  });

  return ids.map((id) => timesheetObj[id]);
};

export const timesheetByIdLoader = () => new Dataloader(batchTimesheetByIdFn);
