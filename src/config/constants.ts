import path from 'path';
import colors from 'colors';
import * as dotenv from 'dotenv';

const env = process.env.NODE_ENV || 'local';

let envload = dotenv.config({
  path: path.join(__dirname, `../../.env.${env}`),
});

if ((!envload || envload.error) && env !== 'test') {
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
  synchronize: ['local', 'development', 'dev', 'stage'].includes(env)
    ? process.env.DATABASE_SYNCHRONIZE == 'true'
    : false,
  logging: ['local', 'development', 'dev'].includes(env),
};

export const entities = {
  users: 'users',
  companies: 'companies',
  roles: 'roles',
  addresses: 'addresses',
  userTokens: 'user_tokens',
  media: 'media',
  tasks: 'tasks',
  taskAssignment: 'task_assignment',
  projects: 'projects',
  workschedule: 'workschedule',
  userRoles: 'user_roles',
  timeEntry: 'time_entries',
  clients: 'clients',
  usersClients: 'users_clients',
  userPayRate: 'user_payrate',
  invoices: 'invoices',
  invoiceItems: 'invoice_items',
  timesheet: 'timesheet',
  taskAttachments: 'task_attachments',
  activityLogs: 'activity_log',
  timesheetAttachments: 'attachments',
  workscheduleDetail: 'workschedule_details',
  workscheduleTimeDetail: 'workschedule_time_details',
  subscriptionPayments: 'subscription_payments',
  timesheetComments: 'timesheet_comments',
  invoicePaymentConfig: 'invoice_payment_config',
  invoiceSchedule: 'invoice_schedule',
  userProject: 'user_project',
};

export enum CompanyStatus {
  Active = 'Active',
  Inactive = 'Inactive',
}

export enum UserStatus {
  Active = 'Active',
  Inactive = 'Inactive',
}

export enum EntryType {
  CICO = 'CICO', // Check-In-Check-Out
  Timesheet = 'Timesheet',
}

export enum ClientStatus {
  Active = 'Active',
  Inactive = 'Inactive',
}

export enum ProjectStatus {
  Active = 'Active',
  Inactive = 'Inactive',
}

export enum TimesheetStatus {
  Pending = 'Pending',
  Approved = 'Approved',
  PartiallyApproved = 'PartiallyApproved',
}

export enum AttachedTimesheetStatus {
  Pending = 'Pending',
  Approved = 'Approved',
  PartiallyApproved = 'PartiallyApproved',
}

export enum TaskStatus {
  UnScheduled = 'UnScheduled',
  Scheduled = 'Scheduled',
  InProgress = 'InProgress',
  Completed = 'Completed',
}

export enum Role {
  SuperAdmin = 'SuperAdmin',
  CompanyAdmin = 'CompanyAdmin',
  Employee = 'Employee',
  TaskManager = 'TaskManager',
  Client = 'Client',
}

export enum CompanyRole {
  CompanyAdmin = 'CompanyAdmin',
  Employee = 'Employee',
  TaskManager = 'TaskManager',
  Client = 'Client',
}

export enum AdminRole {
  SuperAdmin = 'SuperAdmin',
}

export enum TokenType {
  refresh = 'refresh',
  resetPassword = 'resetPassword',
}

export enum InvoiceStatus {
  Pending = 'Pending',
  Received = 'Received',
  Sent = 'Sent',
}

export enum AttachmentType {
  Timesheet = 'Timesheet',
  Attachment = 'Attachment',
  Others = 'Others',
}

export enum ForgotPasswordUserType {
  Company = 'Company',
  SystemAdmin = 'SystemAdmin',
}

export enum UserClientStatus {
  Active = 'Active',
  Inactive = 'Inactive',
}

export enum TimeEntryApprovalStatus {
  Approved = 'Approved',
  Pending = 'Pending',
  Rejected = 'Rejected',
}

export enum InvoiceSchedule {
  Monthly = 'Monthly',
  Biweekly = 'Biweekly',
  Weekly = 'Weekly',
}

export const emailSetting = {
  testMask: process.env.EMAIL_TEST_MASK as string,
  fromEmail: process.env.EMAIL_FROM_EMAIL as string,
  fromName: process.env.EMAIL_FROM_NAME as string,
  sendGridApi: process.env.SENDGRID_API as string,
  emailEnabled: process.env.EMAIL_ENABLED === 'true',
  newUser: {
    subject: process.env.NEW_USER_EMAIL_SUBJECT || '',
    adminBody: process.env.NEW_ADMIN_USER_EMAIL_BODY || '',
    companyBody: process.env.NEW_COMPANY_USER_EMAIL_BODY || '',
  },
  resetPassword: {
    subject: process.env.RESET_PASSWORD_EMAIL_SUBJECT || '',
    body: process.env.RESET_PASSWORD_EMAIL_BODY || '',
  },
  invoice: {
    subject: process.env.INVOICE_EMAIL_SUBJECT || '',
    body: process.env.INVOICE_EMAIL_BODY || '',
  },
  unlockTimesheet: {
    subject: process.env.UNLOCK_TIMESHEET_EMAIL_SUBJECT || '',
    body: process.env.UNLOCK_TIMESHEET_EMAIL_BODY || '',
  },
};

export const events = {
  onUserCreate: 'onUserCreate',
  sendInvoice: 'sendInvoice',
  onTimeEntriesApprove: 'onTimeEntriesApprove',
  onPayRateCreateUpdate: 'onPayRateCreateUpdate',
  onTimeEntryStop: 'onTimeEntryStop',
  onCheckIn: 'onCheckIn',
  onCheckOut: 'onCheckOut',
  onTimeSheetApproveOrReject: 'onTimeSheetApproveOrReject',
  updateCompanySubscriptionUsage: 'updateCompanySubscriptionUsage',
  onTimesheetUnlock: 'onTimesheetUnlock',
  onTimesheetCreate: 'onTimesheetCreate',
  updateWorkscheduleUsage: 'updateWorkscheduleUsage',
};

export const stripeSetting = {
  publishableKey: process.env.STRIPE_PUBLISHABLE_KEY as string,
  secretKey: process.env.STRIPE_SECRET_KEY as string,
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET as string,
};

export const plans = {
  Starter: 'Starter',
  Professional: 'Professional',
};

export const stripePrices = {
  flatPrice: process.env.FLAT_PLAN_PRICE as string,
  perUser: process.env.PER_USER_PLAN_PRICE as string,
};

export const subscriptionStatus = {
  active: 'active',
  inactive: 'inactive',
};

export enum SubscriptionPaymentStatus {
  Paid = 'Paid',
  Pending = 'Pending',
  RequiredAction = 'Requires Action',
}

export default {
  env,
  origins,
  port: process.env.PORT,
  baseUrl: process.env.BASE_URL,
  frontEndUrl: process.env.FRONT_END_URL,
  appName: process.env.APP_NAME || 'Vellorum_API',
  refreshTokenCookieName: process.env.REFRESH_TOKEN_COOKIE_NAME || 'refreshToken',
  saltRounds: process.env.SALT_ROUNDS || 10,
  verificationEmailTokenExpiration: process.env.VERIFICATION_EMAIL_EXPIRATION || '1d',
  refreshTokenExpiration: process.env.REFRESH_TOKEN_EXPIRATION || '7d',
  forgotPasswordTokenExpiration: process.env.FORGOT_PASSWORD_TOKEN_EXPIRATION || '30m',
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
  mediaDestination: './public/uploads',
  fileSize: 10000000,
};
