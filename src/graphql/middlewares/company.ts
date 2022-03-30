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

const name = 'client.middleware';

export const checkCompanyAccess: MiddlewareFn<IGraphqlContext> = async ({ context, args }, next: NextFn) => {
  const operation = 'hasClientAccess';
  const errorService = container.get<IErrorService>(TYPES.ErrorService);

  try {
    const roles = context.user?.roles ?? [];
    const argsCompanyId = args?.input?.company_id ?? args?.input?.query?.company_id;

    // check the users's company_id with the input company_id(both for query as well as mutation)
    const hasCompanyAccess = context?.user?.company?.id === argsCompanyId;

    // Check only if user is not super admin
    if (!isSuperAdmin({ roles }) && !hasCompanyAccess) {
      throw new apiError.ForbiddenError({
        details: [strings.notAllowedToPerformAction],
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
