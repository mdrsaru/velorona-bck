import { inject, injectable } from 'inversify';
import { Request, Response, NextFunction } from 'express';

import config from '../config/constants';
import { TYPES } from '../types';
import { IAuthService } from '../interfaces/auth.interface';
import { ILoginResponse } from '../interfaces/auth.interface';
import { ILogger } from '../interfaces/common.interface';

@injectable()
export default class TokenController {
  private authService: IAuthService;
  private logger: ILogger;

  constructor(
    @inject(TYPES.AuthService) authService: IAuthService,
    @inject(TYPES.LoggerFactory) loggerFactory: (name: string) => ILogger
  ) {
    this.authService = authService;
    this.logger = loggerFactory('TokenController');
  }

  renewAccessToken = async (req: Request, res: Response, next: NextFunction) => {
    const cookie: any = req.cookies || {};
    const refreshToken: string = cookie[config.refreshTokenCookieName];
    let newAccessToken: string = '';
    if (refreshToken) {
      try {
        const tokenResult = await this.authService.renewAccessToken(refreshToken);
        const middleName = tokenResult.middleName ? ` ${tokenResult.middleName}` : '';
        let fullName = `${tokenResult.firstName}${middleName} ${tokenResult.lastName}`;

        return res.status(200).send({
          message: 'Token refresh successful',
          data: {
            accessToken: tokenResult.token,
            _id: tokenResult.id,
            roles: tokenResult.roles,
            company: tokenResult.company,
            fullName: fullName,
            avatar: tokenResult.avatar,
            entryType: tokenResult.entryType,
          },
        });
      } catch (err) {
        this.logger.info({
          operation: 'renewAccessToken',
          message: 'Error renewing access token',
          data: err,
        });
        next(err);
      }
    } else {
      this.logger.info({
        message: 'Refresh token not provided',
        operation: 'renewAccessToken',
      });
      return res.status(400).send({ message: 'Invalid Token' });
    }
  };
}
