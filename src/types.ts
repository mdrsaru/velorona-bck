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
};

const USER_TOKEN = {
  UserTokenRepository: Symbol('UserTokenRepository'),
  UserTokenService: Symbol('UserTokenService'),
  UserTokenController: Symbol('UserTokenController'),
};

const TYPES = {
  ...COMMON,
  ...CLIENT,
  ...USER,
  ...AUTH,
  ...USER_TOKEN,
};

export { TYPES };
