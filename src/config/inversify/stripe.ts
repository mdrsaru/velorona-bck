import { ContainerModule, interfaces } from 'inversify';

import StripeService from '../../services/stripe.service';
import { TYPES } from '../../types';

const stripe = new ContainerModule((bind: interfaces.Bind) => {
  bind<StripeService>(TYPES.StripeService).to(StripeService);
});

export default stripe;
