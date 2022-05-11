import { MiddlewareInterface, ResolverData, NextFn, MiddlewareFn } from 'type-graphql';

import { TYPES } from '../../types';
import { Role as RoleEnum } from '../../config/constants';
import strings from '../../config/strings';
import container from '../../inversify.config';
import * as apiError from '../../utils/api-error';

import { IRoleRepository } from '../../interfaces/role.interface';
import { IErrorService } from '../../interfaces/common.interface';
import { IGraphqlContext } from '../../interfaces/graphql.interface';

const authorize = (...roles: string[]): MiddlewareFn => {
  return async ({ context }: any, next: NextFn) => {
    const userRolesObj = context?.user?.roles?.reduce((acc: any, current: any) => {
      acc[current.name] = current;
      return acc;
    }, {});

    let hasAccess = false;
    for (let role of roles) {
      if (userRolesObj[role]) {
        hasAccess = true;
        break;
      }
    }
    if (!hasAccess) {
      throw new apiError.ForbiddenError({
        details: [strings.notAllowedToPerformAction],
      });
    }

    await next();
  };
};

export default authorize;
