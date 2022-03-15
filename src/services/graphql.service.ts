import get from 'lodash/get';
import { injectable, inject } from 'inversify';

import { TYPES } from '../types';
import config from '../config/constants';
import container from '../inversify.config';
import * as clientLoader from '../loaders/dataloader/client.dataloader';
import * as userLoader from '../loaders/dataloader/user.dataloader';

import { IGraphql, IGraphqlContext } from '../interfaces/graphql.interface';
import { ITokenService, ILogger } from '../interfaces/common.interface';
import { IUserAuth } from '../interfaces/auth.interface';
import { IRoleRepository } from '../interfaces/role.interface';

@injectable()
export default class GraphqlService implements IGraphql {
  private name = 'GraphqlService';
  private tokenService: ITokenService;
  private logger: ILogger;
  private roleRepository: IRoleRepository;

  constructor(
    @inject(TYPES.TokenService) _tokenService: ITokenService,
    @inject(TYPES.LoggerFactory) loggerFactory: (name: string) => ILogger
    //@inject(TYPES.RoleRepository) _roleRepository: IRoleRepository,
  ) {
    this.tokenService = _tokenService;
    this.logger = loggerFactory(this.name);
    //this.roleRepository = _roleRepository;
  }

  formatError(err: any) {
    const message = err.message;
    const code = get(err, 'extensions.exception.code');
    const data = get(err, 'extensions.exception.data');
    const details = get(err, 'extensions.exception.details');
    const path = get(err, 'path');

    return {
      message,
      code,
      data,
      path,
      details,
    };
  }

  setContext = async (args: any): Promise<IGraphqlContext> => {
    const roleRepository = container.get<IRoleRepository>(TYPES.RoleRepository); // could not inject as connection is needed
    const operation = 'setContext';
    const { req, res } = args;
    let user: IUserAuth | undefined;

    try {
      let token = await this.tokenService.extractToken(req.headers);
      if (token) {
        let decoded = await this.tokenService.verifyToken({
          token,
          secretKey: config.accessTokenSecret,
        });

        const roles = decoded?.roles ?? [];
        const userRoles = await roleRepository.getAll({ query: { id: roles } });

        user = {
          id: decoded.id,
          roles: userRoles,
        };
      }
    } catch (err: any) {
      this.logger.info({
        message: err.message,
        operation,
        data: err,
      });
    }

    return {
      req,
      res,
      user,
      loaders: {
        clientByIdLoader: clientLoader.clientByIdLoader(),
        usersByClientIdLoader: userLoader.usersByClientIdLoader(),
        rolesByUserIdLoader: userLoader.rolesByUserIdLoader(),
      },
    };
  };
}
