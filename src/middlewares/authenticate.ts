import { NextFunction, Request, Response } from 'express';
import constants from '../config/constants';
import strings from '../config/strings';
import { NotAuthenticatedError } from '../utils/api-error';
import jwt from 'jsonwebtoken';

export default (req: any, res: Response, next: NextFunction) => {
  try {
    const token = req?.headers?.authorization.split(' ')[1];
    jwt.verify(token, constants.accessTokenSecret, (err: any, decoded: any) => {
      if (err) {
        throw new NotAuthenticatedError({
          message: strings.userNotAuthenticated,
          details: [strings.userNotAuthenticated],
          data: err,
        });
      } else {
        next();
      }
    });
  } catch (err) {
    res.status(401).json({
      error: err,
    });
  }
};
