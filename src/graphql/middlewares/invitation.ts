import find from 'lodash/find';
import { MiddlewareFn, NextFn } from 'type-graphql';

import { TYPES } from '../../types';
import { Role as RoleEnum } from '../../config/constants';
import strings from '../../config/strings';
import container from '../../inversify.config';
import * as apiError from '../../utils/api-error';
import { checkRoles, isSuperAdmin } from '../../utils/roles';

import { IErrorService } from '../../interfaces/common.interface';
import { IGraphqlContext } from '../../interfaces/graphql.interface';

const name = 'user.middleware';

export const canCreateInvitation: MiddlewareFn<IGraphqlContext> = async ({ context, args }, next: NextFn) => {
  const operation = 'canCreateInvitation';
  const errorService = container.get<IErrorService>(TYPES.ErrorService);

  try {
    const roles = context.user?.roles ?? [];
    const hasCompanyAccess = context?.user?.company?.id !== args.input?.company_id;

    if (!isSuperAdmin({ roles }) && hasCompanyAccess) {
      throw new apiError.ForbiddenError({
        details: [strings.canOnlyViewOwnCompany],
      });
    }

    await next();
  } catch (err) {
    errorService.throwError({
      err,
      name,
      operation,
      logError: true,
    });
  }
};

export const canViewInvitation: MiddlewareFn<IGraphqlContext> = async ({ context, args }, next: NextFn) => {
  const operation = 'canViewInvitation';
  const errorService = container.get<IErrorService>(TYPES.ErrorService);

  try {
    const roles = context.user?.roles ?? [];
    const hasCompanyAccess = context?.user?.company?.id !== args.input?.company_id;

    if (!isSuperAdmin({ roles }) && hasCompanyAccess) {
      throw new apiError.ForbiddenError({
        details: [strings.canOnlyViewOwnCompany],
      });
    }

    await next();
  } catch (err) {
    errorService.throwError({
      err,
      name,
      operation,
      logError: true,
    });
  }
};
