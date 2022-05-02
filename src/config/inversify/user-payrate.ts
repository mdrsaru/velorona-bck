import { ContainerModule, interfaces } from 'inversify';
import { UserPayRateResolver } from '../../graphql/resolvers/userPayrate.resolver';
import { IUserPayRateRepository, IUserPayRateService } from '../../interfaces/user-payrate.interface';
import UserPayRateRepository from '../../repository/user-payrate.repository';
import UserPayRateService from '../../services/userPayrate.service';

import { TYPES } from '../../types';

const userpayrate = new ContainerModule((bind: interfaces.Bind, unbind: interfaces.Unbind) => {
  bind<IUserPayRateRepository>(TYPES.UserPayRateRepository).to(UserPayRateRepository);
  bind<IUserPayRateService>(TYPES.UserPayRateService).to(UserPayRateService);
  bind<UserPayRateResolver>(UserPayRateResolver).to(UserPayRateResolver).inSingletonScope();
});

export default userpayrate;
