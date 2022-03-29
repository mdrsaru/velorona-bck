import { MiddlewareFn, NextFn } from 'type-graphql';
import strings from '../../config/strings';
import { IErrorService } from '../../interfaces/common.interface';
import { IGraphqlContext } from '../../interfaces/graphql.interface';
import container from '../../inversify.config';
import { TYPES } from '../../types';
import { isSuperAdmin } from '../../utils/roles';

import * as apiError from '../../utils/api-error';

const name = 'task.middleware';

export const canCreateTask: MiddlewareFn<IGraphqlContext> = async ({ context, args }, next: NextFn) => {
  const operation = 'canCreateTask';
  const errorService = container.get<IErrorService>(TYPES.ErrorService);

  try {
    const roles = context.user?.roles ?? [];
    const hasCompanyAccess = context?.user?.company?.id !== args.input?.company_id;

    if (!isSuperAdmin({ roles }) && hasCompanyAccess) {
      throw new apiError.ForbiddenError({
        details: [strings.canOnlyCreateOnOwnCompany],
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

export const canViewTask: MiddlewareFn<IGraphqlContext> = async ({ context, args }, next: NextFn) => {
  const operation = 'canViewTask';
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
