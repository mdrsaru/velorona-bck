import path from 'path';
import colors from 'colors';
import * as dotenv from 'dotenv';
import { DatabaseType } from 'typeorm';

const env = process.env.NODE_ENV || 'local';

let envload = dotenv.config({
  path: path.join(__dirname, `../../.env.${env}`),
});

if (!envload || envload.error) {
  console.log(colors.yellow(`Error - ${envload?.error?.message}`));
  console.log(colors.yellow('Checking for .env file'));
  envload = dotenv.config({
    path: path.join(__dirname, `../../.env`),
  });
}

if (!envload || envload.error) {
  console.log(colors.yellow(`No .env file found`));
  console.log(colors.yellow(`Error - ${envload?.error?.message}`));
}

const originsEnv = process.env.ORIGINS;
let origins: string[];
try {
  origins = (originsEnv as string).split(',');
} catch (err) {
  origins = ['http://localhost:3000'];
}

export const databaseSetting = {
  name: process.env.POSTGRES_DATABASE_NAME as string,
  username: process.env.POSTGRES_DATABASE_USERNAME as string,
  password: process.env.POSTGRES_DATABASE_PASSWORD as string,
  host: process.env.POSTGRES_DATABASE_HOST as string,
  dialect: process.env.POSTGRES_DATABASE_DIALECT as string,
  port: parseInt((process.env.POSTGRES_DATABASE_PORT as string) || '5432'),
  synchronize: ['local', 'development', 'dev'].includes(env) ? process.env.DATABASE_SYNCHRONIZE == 'true' : false,
  logging: ['local', 'development', 'dev'].includes(env),
};

export const entities = {
  users: 'users',
  clients: 'clients',
  roles: 'roles',
  addresses: 'addresses',
  userTokens: 'user_tokens',
  user_record: 'user_record',
  media: 'media',
};

export enum ClientStatus {
  Active = 'Active',
  Inactive = 'Inactive',
  Archived = 'Archived',
}

export enum UserStatus {
  Active = 'Active',
  Inactive = 'Inactive',
  Archived = 'Archived',
}

export enum Role {
  SuperAdmin = 'SuperAdmin',
  ClientAdmin = 'ClientAdmin',
  Employee = 'Employee',
  TaskManager = 'TaskManager',
  Vendor = 'Vendor',
}

export enum TokenType {
  refresh = 'refresh',
}

export default {
  env,
  origins,
  port: process.env.PORT,
  baseUrl: process.env.BASE_URL,
  appName: process.env.APP_NAME || 'Vellorum_API',
  refreshTokenCookieName: process.env.REFRESH_TOKEN_COOKIE_NAME || 'refreshToken',
  saltRounds: process.env.SALT_ROUNDS || 10,
  verificationEmailTokenExpiration: process.env.VERIFICATION_EMAIL_EXPIRATION || '1d',
  refreshTokenExpiration: process.env.REFRESH_TOKEN_EXPIRATION || '7d',
  forgotPasswordTokenExpiration: process.env.FORGOT_PASSWORD_TOKEN_EXPIRATION || '1hr',
  log: {
    fileLogLevel: process.env.FILE_LOG_LEVEL,
    dirname: process.env.LOG_DIRNAME || '.logs',
    errorLogFilename: process.env.ERROR_LOG_FILENAME || 'error',
    logLevels: {
      error: 'error',
      warn: 'warn',
      info: 'info',
      verbose: 'verbose',
      debug: 'debug',
      silly: 'silly',
    },
  },
  events: {},
  accessTokenSecret: process.env.ACCESS_TOKEN_SECRET || 'accessSecrect',
  accessTokenLife: process.env.ACCESS_TOKEN_LIFE || '15m',
  refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET || 'refreshSecret',
  refreshTokenLife: process.env.REFRESH_TOKEN_LIFE || '7d',
  frontendUrl: process.env.FRONT_END_URL || 'http://localhost:3000',
  changePassword: {
    changePasswordSubject: process.env.CHANGEPASSWORD_SUBJECT || 'Change your password',
    changePasswordBody: process.env.CHANGEPASSWORD_BODY || 'Here is the link',
  },
  mediaDestination: './uploads',
  fileSize: 10000000,
  mediaUrl: process.env.MEDIA_URL || 'http://localhost:8080/media',
};
