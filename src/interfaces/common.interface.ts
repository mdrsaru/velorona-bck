import { ResetPasswordResponse } from '../entities/auth.entity';
import { CustomError } from '../utils/api-error';
import { IPagingArgs, IGetAllAndCountResult, IGetOptions } from './paging.interface';

export interface IEntityID {
  id: string;
  relations?: string[];
}

export interface IEntityRemove extends IEntityID {}

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

export interface ITokenService {
  generateToken(args: any): Promise<string>;
  verifyToken(data: ITokenVerificationInput): Promise<any>;
  extractToken(args: any): string;
}

export interface IEmailService {
  sendEmail(args: any): Promise<any>;
}
// app
export interface IAppService {
  getStatus(): string;
}

export interface IBaseRepository<T> {
  getAllAndCount(args: IGetOptions): Promise<IGetAllAndCountResult<T>>;
  getAll(args: IGetOptions): Promise<T[]>;
  getById(args: IEntityID): Promise<T | undefined>;
  remove(args: IEntityRemove): Promise<T>;
}

export interface ITokenVerificationInput {
  token: string;
  secretKey: string;
}

export interface ITokenArgs {
  tokenLife: string;
  tokenSecret: string;
  payload: any;
}
