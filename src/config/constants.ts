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

export const aws = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  bucket: process.env.AWS_BUCKET as string,
  bucketKey: process.env.AWS_BUCKET_KEY as string,
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
  userProject: 'user_project',
  demoRequest: 'demo_requests',
  breakTimes: 'break_times',
  currency: 'currency',
  blockedEmails: 'blocked_emails',
};

export enum CompanyStatus {
  Active = 'Active',
  Inactive = 'Inactive',
  Unapproved = 'Unapproved',
}

export enum UserStatus {
  InvitationSent = 'Invitation Sent',
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
  Open = 'Open',
  Submitted = 'Submitted',
  Approved = 'Approved',
  PartiallyApproved = 'PartiallyApproved',
  Rejected = 'Rejected',
}

export enum AttachedTimesheetStatus {
  Pending = 'Pending',
  Approved = 'Approved',
  PartiallyApproved = 'PartiallyApproved',
  Rejected = 'Rejected',
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
  BookKeeper = 'BookKeeper',
}

export enum CompanyRole {
  CompanyAdmin = 'CompanyAdmin',
  Employee = 'Employee',
  TaskManager = 'TaskManager',
  Client = 'Client',
  BookKeeper = 'BookKeeper',
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
  Expense = 'Expense',
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
  Custom = 'Custom',
}

export enum DemoRequestStatus {
  Pending = 'Pending',
  Approved = 'Approved',
  Rejected = 'Rejected',
}

export enum CollectionMethod {
  ChargeAutomaticatically = 'charge_automatically',
  SendInvoice = 'send_invoice',
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
  managerSubmitTimesheet: {
    subject: process.env.MANAGER_SUBMIT_TIMESHEET_EMAIL_SUBJECT || '',
  },
  userSubmitTimesheet: {
    subject: process.env.USER_SUBMIT_TIMESHEET_EMAIL_SUBJECT || '',
  },
  contactUs: {
    contactEmailAddress: process.env.CONTACT_EMAIL_ADDRESS as string,
    subject: process.env.CONTACT_US_SUBJECT || 'Contact us',
  },
  contactAcknowledgement: {
    contactEmailAddress: process.env.CONTACT_EMAIL_ADDRESS as string,
    subject: process.env.CONTACT_ACKNOWLEDGEMENT_SUBJECT || 'Confirmation email',
  },
  workscheduleDetail: {
    subject: process.env.WORKSCHEDULE_DETAIL_ADDED_SUBJECT || '',
  },
  submitTimesheetReminder: {
    subject: process.env.SUBMIT_TIMESHEET_REMINDER_EMAIL_SUBJECT || '',
  },
  approveTimesheetReminder: {
    subject: process.env.APPROVE_TIMESHEET_REMINDER_EMAIL_SUBJECT || '',
  },
  subscriptionEndReminder: {
    subject: process.env.SUBSCRIPTION_END_REMINDER_EMAIL_SUBJECT || '',
  },
  companyRegistered: {
    subject: process.env.COMPANY_REGISTERED_EMAIL_SUBJECT || '',
  },
  paymentSuccessful: {
    subject: process.env.PAYMENT_SUCCEED_EMAIL_SUBJECT || '',
  },
  demoRequest: {
    subject: process.env.DEMO_REQUEST_EMAIL_SUBJECT || '',
  },
  demoRequestAcknowledgement: {
    subject: process.env.DEMO_REQUEST_ACKNOWLEDGEMENT_EMAIL_SUBJECT || '',
  },
  timesheetStatusUpdate: {
    subject: process.env.TIMESHEET_STATUS_UPDATE_EMAIL_SUBJECT || '',
  },
  approverAddEmail: {
    subject: process.env.APPROVER_ADD_EMPLOYEE_EMAIL_SUBJECT || '',
  },
  threeMonthTrial: {
    subject: process.env.THREE_MONTH_TRIAL_EMAIL_SUBJECT || '',
  },
  updateSubscription: {
    subject: process.env.UPDATE_SUBSCRIPTION_EMAIL_SUBJECT || '',
  },
  invoiceCompany: {
    subject: process.env.INVOICE_COMPANY_EMAIL_SUBJECT || '',
  },
  subscriptionPaymentReminder: {
    subject: process.env.SUBSCRIPTION_PAYMENT_REMINDER_EMAIL_SUBJECT || '',
  },
  paymentDeclinedReminder: {
    subject: process.env.PAYMENT_DECLINED_EMAIL_SUBJECT || '',
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
  onSubscriptionCreate: 'onSubscriptionCreate',
  updateWorkscheduleUsage: 'updateWorkscheduleUsage',
  sendTimesheetSubmitEmail: 'sendTimesheetSubmitEmail',
  onWorkscheduleDetailCreate: 'onWorkscheduleDetailCreate',
  onTimesheetSubmitReminder: 'onTimesheetSubmitReminder',
  onTimesheetApproveReminder: 'onTimesheetApproveReminder',
  onSubscriptionEndReminder: 'onSubscriptionEndReminder',
  onCompanyRegistered: 'onCompanyRegistered',
  onSubscriptionCharged: 'onSubscriptionCharged',
  onDemoRequestCreate: 'onDemoRequestCreate',
  onApproverAdded: 'OnApproverAdded',
  onCompanyApproved: 'OnCompanyApproved',
  onSubscriptionUpdate: 'onSubscriptionUpdate',
  onSubscriptionDowngrade: 'OnSubscriptionDowngrade',
  onInvoiceFinalized: 'onInvoiceFinalized',
  onClientInvoiceReminder: 'onClientInvoiceReminder',
  onPaymentDeclined: 'onPaymentDeclined',
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
  canceled: 'canceled',
  trialing: 'trialing',
  past_due: 'past_due',
  unpaid: 'unpaid',
  incomplete: 'incomplete',
  incomplete_expired: 'incomplete_expired',
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
  amount: 1000,
};
