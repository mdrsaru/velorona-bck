const CLIENT = {
  ClientRepository: Symbol('ClientRepository'),
  ClientService: Symbol('ClientService'),
  ClientController: Symbol('ClientController'),
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
  ...CLIENT,
  ...USER,
  ...AUTH,
  ...USER_TOKEN,
  ...MEDIA,
  ...INVITATION,
  ...TASK,
};

export { TYPES };
