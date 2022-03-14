import { NextFn, MiddlewareFn } from 'type-graphql';

import strings from '../../config/strings';
import * as apiError from '../../utils/api-error';

const authenticate: MiddlewareFn = ({ context, args }: any, next: NextFn) => {
  if (!context.user) {
    throw new apiError.NotAuthenticatedError({
      message: strings.userNotAuthenticated,
      details: [strings.userNotAuthenticated],
      data: args,
    });
  }

  return next();
};

export default authenticate;
