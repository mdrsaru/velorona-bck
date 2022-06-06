import { NextFunction, Request, Response } from 'express';
import constants from '../config/constants';
import strings from '../config/strings';
import { NotAuthenticatedError } from '../utils/api-error';
import container from '../inversify.config';
import { ITokenService } from '../interfaces/common.interface';
import { TYPES } from '../types';

export default async (req: any, res: Response, next: NextFunction) => {
  const tokenService = container.get<ITokenService>(TYPES.TokenService);
  try {
    let token = await tokenService.extractToken(req.headers);
    if (token) {
      await tokenService.verifyToken({
        token: token,
        secretKey: constants.accessTokenSecret,
      });
      next();
    } else {
      throw new NotAuthenticatedError({
        message: strings.userNotAuthenticated,
        details: [strings.userNotAuthenticated],
      });
    }
  } catch (err) {
    res.status(401).json({
      error: err,
    });
  }
};
