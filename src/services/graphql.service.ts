import get from 'lodash/get';
import { injectable, inject } from 'inversify';

import { TYPES } from '../types';
import { IGraphql } from '../interfaces/graphql.interface';

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

  setContext = async (args: any) => {
    const { req, res } = args;
    return { req, res };
  };
}
