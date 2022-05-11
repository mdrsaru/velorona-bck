import { NextFn, MiddlewareFn } from 'type-graphql';
import find from 'lodash/find';
import set from 'lodash/set';

import { TYPES } from '../../types';
import { Role as RoleEnum } from '../../config/constants';
import strings from '../../config/strings';
import container from '../../inversify.config';
import * as apiError from '../../utils/api-error';
import { checkRoles } from '../../utils/roles';

import { IRoleRepository } from '../../interfaces/role.interface';
import { IErrorService } from '../../interfaces/common.interface';
import { IGraphqlContext } from '../../interfaces/graphql.interface';

const name = 'user.middleware';

export const canCreateSystemAdmin: MiddlewareFn<IGraphqlContext> = async ({ context, args }, next: NextFn) => {
  const operation = 'canCreateSystemAdmin';
  const errorService = container.get<IErrorService>(TYPES.ErrorService);
  const roleRepo = container.get<IRoleRepository>(TYPES.RoleRepository);

  try {
    const roles = context.user?.roles ?? [];
    const superAdmin = find(roles, { name: RoleEnum.SuperAdmin });

    // If user is trying to create super admin
    if (superAdmin) {
      // check if the logged in user is super admin
      if (!find(context?.user?.roles, { id: superAdmin.id })) {
        throw new apiError.ForbiddenError({
          details: [strings.notAllowedToCreateAdmin],
        });
      }
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

/**
 * Check if the user is the owner of the resource
 * Has access for super admin.
 */
export const isSelf: MiddlewareFn<IGraphqlContext> = async ({ context, args }, next: NextFn) => {
  const operation = 'isSelf';
  const errorService = container.get<IErrorService>(TYPES.ErrorService);

  try {
    const isSuperAdmin = checkRoles({
      expectedRoles: [RoleEnum.SuperAdmin],
      userRoles: context?.user?.roles ?? [],
    });

    if (isSuperAdmin) {
      return await next();
    }

    if (args?.input?.id !== context?.user?.id) {
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

/**
 * Filters user list by company_id
 * Ignores if the logged in user is super admin.
 */
export const filterCompany: MiddlewareFn<IGraphqlContext> = async ({ context, args }, next: NextFn) => {
  const operation = 'filterCompany';
  const errorService = container.get<IErrorService>(TYPES.ErrorService);

  try {
    const isSuperAdmin = checkRoles({
      expectedRoles: [RoleEnum.SuperAdmin],
      userRoles: context?.user?.roles ?? [],
    });

    if (!isSuperAdmin) {
      args = args ?? {};
      set(args, 'input.query.company_id', context?.user?.company?.id);
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
