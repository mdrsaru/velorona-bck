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
  UserRecordRepository: Symbol('UserRecordRepository'),
  HandlebarsService: Symbol('HandlebarsService'),
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

const INVITATION = {
  InvitationService: Symbol('InvitationService'),
  InvitationRepository: Symbol('InvitationRepository'),
};

const TYPES = {
  ...COMMON,
  ...COMPANY,
  ...USER,
  ...AUTH,
  ...USER_TOKEN,
  ...MEDIA,
  ...INVITATION,
  ...TASK,
  ...TASK_ASSIGNMENT,
  ...PROJECT,
  ...WORKSCHEDULE,
};

export { TYPES };
