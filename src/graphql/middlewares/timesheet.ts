import set from 'lodash/set';
import { MiddlewareFn, NextFn } from 'type-graphql';

import { IGraphqlContext } from '../../interfaces/graphql.interface';
import container from '../../inversify.config';
import { IErrorService } from '../../interfaces/common.interface';
import { TYPES } from '../../types';
import { Role as RoleEnum } from '../../config/constants';
import { checkRoles } from '../../utils/roles';

const name = 'timesheet.middleware';

/**
 * Filter timesheet list by user_id if the logged in user is not super admin or company admin
 */
export const filterTimesheetByUser: MiddlewareFn<IGraphqlContext> = async ({ context, args }, next: NextFn) => {
  const operation = 'filterTimesheetByUser';
  const errorService = container.get<IErrorService>(TYPES.ErrorService);

  try {
    const canAccessOtherTimesheet = checkRoles({
      expectedRoles: [RoleEnum.SuperAdmin, RoleEnum.CompanyAdmin],
      userRoles: context?.user?.roles ?? [],
    });

    if (!canAccessOtherTimesheet) {
      args = args ?? {};
      set(args, 'input.query.user_id', context?.user?.id);
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
