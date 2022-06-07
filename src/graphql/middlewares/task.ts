import { NextFn, MiddlewareFn } from 'type-graphql';
import set from 'lodash/set';

import { TYPES } from '../../types';
import { Role as RoleEnum } from '../../config/constants';
import container from '../../inversify.config';
import { checkRoles } from '../../utils/roles';

import { IErrorService } from '../../interfaces/common.interface';
import { IGraphqlContext } from '../../interfaces/graphql.interface';

/**
 * Filters task list by user_id if loggedin user is employee
 * Adds user_id to the query args for filtering employee's tasks
 */
export const filterTasksForEmployees: MiddlewareFn<IGraphqlContext> = async ({ context, args }, next: NextFn) => {
  const operation = 'filterCompany';
  const errorService = container.get<IErrorService>(TYPES.ErrorService);

  const isEmployee = checkRoles({
    expectedRoles: [RoleEnum.Employee],
    userRoles: context?.user?.roles ?? [],
  });

  if (isEmployee) {
    args = args ?? {};
    set(args, 'input.query.user_id', context?.user?.id);
  }

  await next();
};
