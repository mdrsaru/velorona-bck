import { ContainerModule, interfaces } from 'inversify';
import { ActivityLogResolver } from '../../graphql/resolvers/activity-log';
import { IActivityLogRepository, IActivityLogService } from '../../interfaces/activity-log.interface';
import ActivityLogRepository from '../../repository/activity-log.repository';
import ActivityLogService from '../../services/activity-log.service';

import { TYPES } from '../../types';

const activityLog = new ContainerModule((bind: interfaces.Bind, unbind: interfaces.Unbind) => {
  bind<IActivityLogRepository>(TYPES.ActivityLogRepository).to(ActivityLogRepository);
  bind<IActivityLogService>(TYPES.ActivityLogService).to(ActivityLogService);
  bind<ActivityLogResolver>(ActivityLogResolver).to(ActivityLogResolver).inSingletonScope();
});

export default activityLog;
