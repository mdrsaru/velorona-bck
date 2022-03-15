import { ContainerModule, interfaces } from 'inversify';

import { TYPES } from '../../types';

import { IUserTokenService, IUserTokenRepository, ITokenService } from '../../interfaces/user-token.interface';
import UserTokenService from '../../services/user-token.service';
import UserTokenRepository from '../../repository/user-token.repository';

const userToken = new ContainerModule((bind: interfaces.Bind, unbind: interfaces.Unbind) => {
  bind<IUserTokenRepository>(TYPES.UserTokenRepository).to(UserTokenRepository);
  bind<IUserTokenService>(TYPES.UserTokenService).to(UserTokenService);
});

export default userToken;
