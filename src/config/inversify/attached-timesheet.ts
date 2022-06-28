import { ContainerModule, interfaces } from 'inversify';

import { AttachedTimesheetResolver } from '../../graphql/resolvers/attached-timesheet';
import AttachedTimesheetRepository from '../../repository/attached-timesheet.repository';
import AttachedTimesheetService from '../../services/attached-timesheet.service';

import { IAttachedTimesheetRepository, IAttachedTimesheetService } from '../../interfaces/attached-timesheet.interface';

import { TYPES } from '../../types';

const attachedTimesheet = new ContainerModule((bind: interfaces.Bind, unbind: interfaces.Unbind) => {
  bind<IAttachedTimesheetRepository>(TYPES.AttachedTimesheetRepository).to(AttachedTimesheetRepository);
  bind<IAttachedTimesheetService>(TYPES.AttachedTimesheetService).to(AttachedTimesheetService);
  bind<AttachedTimesheetResolver>(AttachedTimesheetResolver).to(AttachedTimesheetResolver).inSingletonScope();
});

export default attachedTimesheet;
