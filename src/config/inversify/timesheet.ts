import { ContainerModule, interfaces } from 'inversify';
import { TimesheetResolver } from '../../graphql/resolvers/timesheet.resolver';
import { ITimesheetRepository, ITimesheetService } from '../../interfaces/timesheet.interface';
import TimesheetRepository from '../../repository/timesheet.repository';
import TimesheetService from '../../services/timesheet.service';

import { TYPES } from '../../types';

const timesheet = new ContainerModule((bind: interfaces.Bind, unbind: interfaces.Unbind) => {
  bind<ITimesheetRepository>(TYPES.TimesheetRepository).to(TimesheetRepository);
  bind<ITimesheetService>(TYPES.TimesheetService).to(TimesheetService);
  bind<TimesheetResolver>(TimesheetResolver).to(TimesheetResolver).inSingletonScope();
});

export default timesheet;
