const COMMON = {
  AppService: Symbol('AppService'),
  AppController: Symbol('AppController'),
  Logger: Symbol('Logger'),
  LoggerFactory: Symbol('LoggerFactory'),
  GraphqlService: Symbol('GrahqlService'),
  HashService: Symbol('HashService'),
  TokenService: Symbol('TokenService'),
  EmailService: Symbol('EmailService'),
  AuthenticateMiddleware: Symbol('AuthenticateMiddleware'),
  ErrorService: Symbol('ErrorService'),
  JoiService: Symbol('JoiService'),
  RoleService: Symbol('RoleService'),
  RoleRepository: Symbol('RoleRepository'),
  AddressService: Symbol('AddressService'),
  AddressRepository: Symbol('AddressRepository'),
  HandlebarsService: Symbol('HandlebarsService'),
  UserClientRepository: Symbol('UserClientRepository'),
};

const COMPANY = {
  CompanyRepository: Symbol('CompanyRepository'),
  CompanyService: Symbol('CompanyService'),
  CompanyController: Symbol('CompanyController'),
};

const USER = {
  UserRepository: Symbol('UserRepository'),
  UserService: Symbol('UserService'),
  UserController: Symbol('UserController'),
};

const AUTH = {
  AuthService: Symbol('AuthService'),
};

const TASK = {
  TaskRepository: Symbol('TaskRepository'),
  TaskService: Symbol('TaskService'),
  TaskController: Symbol('TaskController'),
  TaskAssignmentRepository: Symbol('TaskAssignmentRepository'),
};

const TASK_ASSIGNMENT = {
  TaskAssignmentRepository: Symbol('TaskAssignmentRepository'),
  TaskAssignmentService: Symbol('TaskAssignmentService'),
  TaskAssignmentController: Symbol('TaskAssignmentController'),
};

const WORKSCHEDULE = {
  WorkscheduleRepository: Symbol('WorkscheduleRepository'),
  WorkscheduleService: Symbol('WorkscheduleService'),
  WorkscheduleController: Symbol('WorkscheduleController'),
};

const PROJECT = {
  ProjectRepository: Symbol('ProjectRepository'),
  ProjectService: Symbol('ProjectService'),
  ProjectController: Symbol('ProjectController'),
};

const TIME_ENTRY = {
  TimeEntryRepository: Symbol('TimeEntryRepository'),
  TimeEntryService: Symbol('TimeEntryService'),
  TimeEntryController: Symbol('TimeEntryController'),
};

const USERCLIENT = {
  UserClientRepository: Symbol('UserClientRepository'),
  UserClientService: Symbol('UserClientService'),
  UserClientController: Symbol('UserClientController'),
};

const USER_TOKEN = {
  UserTokenRepository: Symbol('UserTokenRepository'),
  UserTokenService: Symbol('UserTokenService'),
  UserTokenController: Symbol('UserTokenController'),
};

const MEDIA = {
  MediaController: Symbol('MediaController'),
  MediaService: Symbol('MediaService'),
  MediaRepository: Symbol('MediaRepository'),
};

const CLIENT = {
  ClientService: Symbol('ClientService'),
  ClientRepository: Symbol('ClientRepository'),
  ClientController: Symbol('ClientController'),
};

const USERPAYRATE = {
  UserPayRateService: Symbol('UserPayRateService'),
  UserPayRateRepository: Symbol('UserPayRateRepository'),
  UserPayRateController: Symbol('UserPayRateController'),
};

const INVOICE = {
  InvoiceRepository: Symbol('InvoiceRepository'),
  InvoiceService: Symbol('InvoiceService'),
  InvoiceController: Symbol('InvoiceController'),
};

const INVOICE_ITEMS = {
  InvoiceItemRepository: Symbol('InvoiceItemRepository'),
  InvoiceItemService: Symbol('InvoiceItemService'),
  InvoiceItemController: Symbol('InvoiceItemController'),
};

const TIMESHEET = {
  TimesheetRepository: Symbol('TimesheetRepository'),
  TimesheetService: Symbol('TimesheetService'),
  TimesheetController: Symbol('TimesheetController'),
};

const TYPES = {
  ...COMMON,
  ...COMPANY,
  ...USER,
  ...AUTH,
  ...USER_TOKEN,
  ...MEDIA,
  ...TASK,
  ...TASK_ASSIGNMENT,
  ...PROJECT,
  ...WORKSCHEDULE,
  ...TIME_ENTRY,
  ...USERCLIENT,
  ...CLIENT,
  ...USERPAYRATE,
  ...INVOICE,
  ...INVOICE_ITEMS,
  ...TIMESHEET,
};

export { TYPES };
