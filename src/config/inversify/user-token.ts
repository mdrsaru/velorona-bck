import { ContainerModule, interfaces } from 'inversify';

import { TYPES } from '../../types';

import {
  IUserTokenService,
  IUserTokenRepository,
} from '../../interfaces/user-token.interface';
import { ITokenService } from '../../interfaces/common.interface';

import UserTokenService from '../../services/user-token.service';
import UserTokenRepository from '../../repository/user-token.repository';
import TokenController from '../../controllers/token.controller';

const userToken = new ContainerModule(
  (bind: interfaces.Bind, unbind: interfaces.Unbind) => {
    bind<IUserTokenRepository>(TYPES.UserTokenRepository).to(
      UserTokenRepository
    );
    bind<IUserTokenService>(TYPES.UserTokenService).to(UserTokenService);
    bind<TokenController>(TYPES.UserTokenController).to(TokenController);
  }
);

export default userToken;
