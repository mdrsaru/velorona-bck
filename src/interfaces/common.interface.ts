import { ResetPasswordResponse } from '../entities/auth.entity';
import { CustomError } from '../utils/api-error';
import { IPagingArgs, IGetAllAndCountResult, IGetOptions } from './paging.interface';
import { Express } from 'express';

export type Maybe<T> = T | undefined;

export interface IEntityID {
  id: string;
  relations?: string[];
  select?: string[];
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

export type EmailAttachmentInput = {
  content: string;
  filename: string;
  contentType?: string;
  cid?: string;
  encoding?: string | undefined;
  contentDisposition?: 'attachment' | 'inline' | undefined;
};

export interface IJoiService {
  validate(args: IValidationInput): any;
}

export interface IReminderInput {
  date: string;
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

export interface IEmailBasicArgs {
  to: string;
  from: string;
  subject: string;
  data?: any;
  cc?: string;
  html?: string;
  text?: string;
  templateId?: string;
  attachments?: EmailAttachmentInput[];
}

export interface IEmailArgs extends IEmailBasicArgs {}

export interface IEmailService {
  sendEmail(args: IEmailArgs): Promise<any>;
}
// app
export interface IAppService {
  getStatus(): string;
}

export interface IBaseRepository<T> {
  getAllAndCount(args: IGetOptions): Promise<IGetAllAndCountResult<T>>;
  getAll(args: IGetOptions): Promise<T[]>;
  getById(args: IEntityID): Promise<T | undefined>;
  getSingleEntity(args: ISingleEntityQuery): Promise<T | undefined>;
  remove(args: IEntityRemove): Promise<T>;
  countEntities(args: IGetOptions): Promise<number>;
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

export interface ITemplateArgs {
  template: string;
  data: any;
}

export interface ITemplateService {
  compile(args: ITemplateArgs): string;
}

export interface ISingleEntityQuery {
  query: any;
  relations?: string[];
  select?: string[];
}

export interface ICountInput {
  company_id: string;
}

export interface IUploadArgs {
  file: Express.Multer.File | undefined;
}

export interface IBlockedEmailsRepository {
  create(args: { emails: string[] }): any;
  removeMany(args: { emails: string[] }): any;
}

export interface IUploadService {
  upload(args: IUploadArgs): Promise<string>;
}
