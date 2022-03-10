import get from 'lodash/get';
import { injectable, inject } from 'inversify';

import { TYPES } from '../types';
import container from '../inversify.config';
import { IGraphql, IGraphqlContext } from '../interfaces/graphql.interface';
import * as clientLoader from '../loaders/dataloader/client.dataloader';
import * as userLoader from '../loaders/dataloader/user.dataloader';

@injectable()
export default class GraphqlService implements IGraphql {
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

  setContext = (args: any): IGraphqlContext => {
    const { req, res } = args;
    return {
      req,
      res,
      loaders: {
        clientByIdLoader: clientLoader.clientByIdLoader(),
        usersByClientIdLoader: userLoader.usersByClientIdLoader(),
      },
    };
  };
}
