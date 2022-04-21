import { ContainerModule, interfaces } from 'inversify';

import { TYPES } from '../../types';

import { ITimesheetRepository, ITimesheetService } from '../../interfaces/timesheet.interface';
import { TimesheetResolver } from '../../graphql/resolvers/timesheet.resolver';
import TimesheetRepository from '../../repository/timesheet.repository';
import TimesheetService from '../../services/timesheet.service';

const timesheet = new ContainerModule((bind: interfaces.Bind, unbind: interfaces.Unbind) => {
  bind<ITimesheetRepository>(TYPES.TimesheetRepository).to(TimesheetRepository);
  bind<ITimesheetService>(TYPES.TimesheetService).to(TimesheetService);
  bind<TimesheetResolver>(TimesheetResolver).to(TimesheetResolver).inSingletonScope();
});

export default timesheet;
