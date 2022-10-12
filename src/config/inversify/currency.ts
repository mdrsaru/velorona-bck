import { ContainerModule, interfaces } from 'inversify';

import { TYPES } from '../../types';

// interface
import { ICurrencyRepository, ICurrencyService } from '../../interfaces/currency.interface';

// DemoRequest
import CurrencyService from '../../services/currency.service';

// Resolvers
import { CurrencyResolver } from '../../graphql/resolvers/currency';
import CurrencyRepository from '../../repository/currency.repository';

const currency = new ContainerModule((bind: interfaces.Bind, unbind: interfaces.Unbind) => {
  bind<ICurrencyRepository>(TYPES.CurrencyRepository).to(CurrencyRepository);
  bind<ICurrencyService>(TYPES.CurrencyService).to(CurrencyService);
  bind<CurrencyResolver>(CurrencyResolver).to(CurrencyResolver).inSingletonScope();
});

export default currency;
