import { injectable, inject } from 'inversify';
import ms from 'ms';

import { TYPES } from '../types';
import UserToken from '../entities/user-token.entity';
import {
  IUserTokenCreate,
  IUserTokenDeleteByToken,
  IUserTokenDeleteByUserId,
  IUserTokenRepository,
  IUserTokenService,
  IUserTokenDeleteByUserIdAndType,
} from '../interfaces/user-token.interface';
import { IErrorService, ITokenService } from '../interfaces/common.interface';

@injectable()
export default class UserTokenService implements IUserTokenService {
  private name = 'UserTokenService';
  private userTokenRepository: IUserTokenRepository;
  private tokenService: ITokenService;
  private errorService: IErrorService;

  constructor(
    @inject(TYPES.UserTokenRepository)
    userTokenRepository: IUserTokenRepository,
    @inject(TYPES.TokenService) tokenService: ITokenService,
    @inject(TYPES.ErrorService) errorService: IErrorService
  ) {
    this.userTokenRepository = userTokenRepository;
    this.tokenService = tokenService;
    this.errorService = errorService;
  }

  getByToken = async (token: string): Promise<UserToken | undefined> => {
    const operation = 'getByToken';

    try {
      let result = await this.userTokenRepository.getByToken(token);
      return result;
    } catch (err) {
      this.errorService.throwError({
        err,
        operation,
        name: this.name,
        logError: true,
      });
    }
  };

  create = async (args: IUserTokenCreate): Promise<UserToken> => {
    const operation = 'create';

    try {
      const userToken = await this.userTokenRepository.create({
        token: args.token,
        expiresIn: new Date(Date.now() + ms(args.expiresIn)),
        user_id: args.user_id,
        tokenType: args.tokenType,
      });

      return userToken;
    } catch (err) {
      this.errorService.throwError({
        err,
        operation,
        name: this.name,
        logError: true,
      });
    }
  };

  deleteByToken(args: IUserTokenDeleteByToken): Promise<UserToken | undefined> {
    return this.userTokenRepository.deleteByToken(args);
  }

  deleteByUserId(args: IUserTokenDeleteByUserId): Promise<boolean> {
    return this.userTokenRepository.deleteByUserId(args);
  }

  deleteByUserIdAndType(args: IUserTokenDeleteByUserIdAndType): Promise<boolean> {
    return this.userTokenRepository.deleteByUserIdAndType(args);
  }
}
