import { ContainerModule, interfaces } from 'inversify';

import { TYPES } from '../../types';

import { ISubscriptionPaymentRepository } from '../../interfaces/subscription-payment.interface';

import SubscriptionPaymentRepository from '../../repository/subscription-payment.repository';
import SubscriptionPaymentService from '../../services/subscription-payment.service';
import { SubscriptionPaymentResolver } from '../../graphql/resolvers/subscription-payment.resolver';

const subscriptionPayment = new ContainerModule((bind: interfaces.Bind, unbind: interfaces.Unbind) => {
  bind<ISubscriptionPaymentRepository>(TYPES.SubscriptionPaymentRepository).to(SubscriptionPaymentRepository);
  bind<SubscriptionPaymentService>(TYPES.SubscriptionPaymentService).to(SubscriptionPaymentService);
  bind<SubscriptionPaymentResolver>(SubscriptionPaymentResolver).to(SubscriptionPaymentResolver).inSingletonScope();
});

export default subscriptionPayment;
