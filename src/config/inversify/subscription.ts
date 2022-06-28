import { ContainerModule, interfaces } from 'inversify';

import SubscriptionService from '../../services/subscription.service';
import { SubscriptionResolver } from '../../graphql/resolvers/subscription.resolver';
import { TYPES } from '../../types';
import { ISubscriptionService } from '../../interfaces/subscription.interface';

const subscription = new ContainerModule((bind: interfaces.Bind) => {
  bind<ISubscriptionService>(TYPES.SubscriptionService).to(SubscriptionService);
  bind<SubscriptionResolver>(SubscriptionResolver).to(SubscriptionResolver).inSingletonScope();
});

export default subscription;
