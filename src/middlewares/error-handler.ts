import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';

import { IError } from '../interfaces/error.interface';

export default (err: IError, req: Request, res: Response, next: NextFunction) => {
  if (err.code) {
    if (typeof err.code === 'number') {
      return res.status(err.code).send({
        message: err.message,
        details: err?.details ?? [],
        data: err.data,
      });
    } else {
      return res.status(500).send({
        message: 'Internal server error',
        details: ['Internal server error'],
        data: err.data,
      });
    }
  } else {
    return res.status(500).send({
      message: 'Internal server error',
      details: ['Internal server error'],
      data: err.data,
    });
  }
};
