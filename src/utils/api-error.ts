import { IError } from '../interfaces/error.interface';

export class CustomError extends Error {
  readonly message: string;
  readonly code: number;
  readonly error: any;
  readonly data: any;
  readonly translationKey: string;
  readonly details: Array<string>;

  constructor({ message, code, details, error, data }: IError) {
    super(message);
    this.code = code || 500;
    this.details = details;
    this.error = error || null;
    this.data = data || null;
    this.message = message as string;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class AppError extends CustomError {
  /**
   * Create a new validation error. Internal Code: 4000
   * @param {Object} args - The args object
   * @param {any} args.error - The error
   * @param {any} args.data - The data
   * @param {String=} args.message - The error message
   * @param {[String]=} args.details - Error details
   */
  constructor(args: IError) {
    super({
      message: args.message,
      code: 500,
      error: args.error,
      data: args.data,
      details: args.details || [],
    });
  }
}

export class ValidationError extends CustomError {
  /**
   * Create a new validation error.
   * @param {Object} args - The args object
   * @param {any} args.error - The error
   * @param {any} args.data - The data
   * @param {string[]} args.details - Error details
   * @param {number} args.code - The error code
   * @param {string=} args.message - The error message
   */
  constructor(args: IError) {
    super({
      message: args.message,
      code: 400,
      error: args.error,
      data: args.data,
      details: args.details || [],
    });
  }
}

export class NotFoundError extends CustomError {
  /**
   * Create a new not found error.
   * @param {Object} args - The args object
   * @param {any} args.error - The error
   * @param {any} args.data - The data
   * @param {string[]} args.details - Error details
   * @param {number} args.code - The error code
   * @param {string=} args.message - The error message
   */
  constructor(args: IError) {
    super({
      message: args.message,
      code: 404,
      error: args.error,
      data: args.data,
      details: args.details || [],
    });
  }
}

export class ForbiddenError extends CustomError {
  /**
   * Create a new forbidden error.
   * @param {Object} args - The args object
   * @param {any} args.error - The error
   * @param {any} args.data - The data
   * @param {string[]} args.details - Error details
   * @param {number} args.code - The error code
   * @param {string=} args.message - The error message
   */
  constructor(args: IError) {
    super({
      message: args.message,
      code: 403,
      error: args.error,
      data: args.data,
      details: args.details,
    });
  }
}

export class NotAuthenticatedError extends CustomError {
  /**
   * Create a new forbidden error.
   * @param {Object} args - The args object
   * @param {any} args.error - The error
   * @param {any} args.data - The data
   * @param {string[]} args.details - Error details
   * @param {number} args.code - The error code
   * @param {string=} args.message - The error message
   */
  constructor(args: IError) {
    super({
      message: args.message,
      code: 401,
      error: args.error,
      data: args.data,
      details: args.details,
    });
  }
}

export class NotImplementedError extends CustomError {
  /**
   * Create a new not implemented error.
   * @param {Object} args - The args object
   * @param {any} args.error - The error
   * @param {any} args.data - The data
   * @param {string[]} args.details - Error details
   * @param {number} args.code - The error code
   * @param {string=} args.message - The error message
   */
  constructor(args: IError) {
    super({
      message: args.message,
      code: 501,
      error: args.error,
      data: args.data,
      details: args.details,
    });
  }
}

export class ConflictError extends CustomError {
  /**
   * Create a new confict error.
   * @param {Object} args - The args object
   * @param {any} args.error - The error
   * @param {any} args.data - The data
   * @param {string[]} args.details - Error details
   * @param {number} args.code - The error code
   * @param {string=} args.message - The error message
   */
  constructor(args: IError) {
    super({
      message: args.message,
      code: 409,
      error: args.error,
      data: args.data,
      details: args.details,
    });
  }
}
