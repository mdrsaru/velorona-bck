import { CustomError } from '../utils/api-error';

export interface IEntityRemove {
  id: string;
}

// Logger
export interface ILoggerInput {
  operation: string;
  message: string;
  data?: any;
}

export interface ILogger {
  init(name: string): void;
  error(args: ILoggerInput): void;
  warn(args: ILoggerInput): void;
  info(args: ILoggerInput): void;
  verbose(args: ILoggerInput): void;
  debug(args: ILoggerInput): void;
  silly(args: ILoggerInput): void;
}

// Error
export interface IErrorArgs {
  name?: string;
  operation: string;
  logError: boolean;
  err: any;
}

export interface IErrorService {
  getError: (args: IErrorArgs) => CustomError;
  throwError: (args: IErrorArgs) => never;
}

// Joi
export interface IValidationInput {
  /**
   * Joi Schema
   */
  schema: any;

  /**
   * Input arguments to be validated against the schema
   */
  input: any;
}

export interface IJoiService {
  validate(args: IValidationInput): any;
}

export interface IHashService {
  hash(password: string, salt?: any): Promise<string>;
  compare(plainText: string, hash: string): Promise<boolean>;
}

// app
export interface IAppService {
  getStatus(): string;
}
