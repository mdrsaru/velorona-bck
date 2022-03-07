import { inject, injectable } from 'inversify';
import Joi from 'joi';
import jwt from 'jsonwebtoken';

import { TYPES } from '../types';
import { IErrorService, IErrorArgs, ILogger } from '../interfaces/common.interface';
import { CustomError, AppError, ValidationError } from '../utils/api-error';

@injectable()
export default class ErrorService implements IErrorService {
  private logger: ILogger;
  constructor(@inject(TYPES.Logger) logger: ILogger) {
    this.logger = logger;
  }

  getError = (args: IErrorArgs) => {
    let err = args.err;

    if (err instanceof Joi.ValidationError) {
      err = new ValidationError({
        details: err.details.map((x) => x.message),
        error: err,
      });
    } else if (!(err instanceof CustomError)) {
      // Error is unknown error
      err = new AppError({
        details: [err?.message],
        error: err,
      });
    }

    if (args.logError) {
      this.logger.init(args.name ?? 'error.service');
      this.logger.error({
        message: err.message,
        operation: args.operation,
        data: err,
      });
    }

    return err;
  };

  throwError = (args: IErrorArgs) => {
    let err = args.err;

    if (err instanceof Joi.ValidationError) {
      err = new ValidationError({
        details: err.details.map((x) => x.message),
        error: err,
      });
    } else if (!(err instanceof CustomError)) {
      // Error is unknown error
      err = new AppError({
        details: [err?.message],
        error: err,
      });
    }

    if (args.logError) {
      this.logger.init(args.name ?? 'error.service');
      this.logger.error({
        message: err.message,
        operation: args.operation,
        data: err,
      });
    }

    throw err;
  };
}
