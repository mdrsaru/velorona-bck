const CLIENT = {
  ClientRepository: Symbol('ClientRepository'),
  ClientService: Symbol('ClientService'),
  ClientController: Symbol('ClientController'),
};

const COMMON = {
  AppService: Symbol('AppService'),
  AppController: Symbol('AppController'),
  Logger: Symbol('Logger'),
  LoggerFactory: Symbol('LoggerFactory'),
  GraphqlService: Symbol('GrahqlService'),
  HashService: Symbol('HashService'),
  AuthenticateMiddleware: Symbol('AuthenticateMiddleware'),
  ErrorService: Symbol('ErrorService'),
  JoiService: Symbol('JoiService'),
  RoleService: Symbol('RoleService'),
  RoleRepository: Symbol('RoleRepository'),
};

const TYPES = {
  ...COMMON,
  ...CLIENT,
};

export { TYPES };
