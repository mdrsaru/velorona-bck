import { ContainerModule, interfaces } from 'inversify';

import { TYPES } from '../../types';

import { IActivityLogRepository, IActivityLogService } from '../../interfaces/activityLog.interface';

import { ActivityLogResolver } from '../../graphql/resolvers/activityLog';
import ActivityLogRepository from '../../repository/activityLog.repository';
import ActivityLogService from '../../services/activityLog.service';

const activityLog = new ContainerModule((bind: interfaces.Bind, unbind: interfaces.Unbind) => {
  bind<IActivityLogRepository>(TYPES.ActivityLogRepository).to(ActivityLogRepository);
  bind<IActivityLogService>(TYPES.ActivityLogService).to(ActivityLogService);
  bind<ActivityLogResolver>(ActivityLogResolver).to(ActivityLogResolver).inSingletonScope();
});

export default activityLog;
