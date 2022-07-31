import { MiddlewareFn, NextFn } from 'type-graphql';
import { IGraphqlContext } from '../../interfaces/graphql.interface';
import container from '../../inversify.config';
import { IErrorService } from '../../interfaces/common.interface';
import { TYPES } from '../../types';
import { Role as RoleEnum, EntryType } from '../../config/constants';
import { checkRoles } from '../../utils/roles';
import * as apiError from '../../utils/api-error';
import strings from '../../config/strings';

const name = 'time-entry.middleware';

export const checkRoleAndFilterTimeEntry: MiddlewareFn<IGraphqlContext> = async ({ context, args }, next: NextFn) => {
  const operation = 'checkRoleAndFilterTimeEntry';
  const errorService = container.get<IErrorService>(TYPES.ErrorService);

  try {
    const created_by = context.user?.id;

    let ids = args.input.ids;
    // Check only if user is not super admin and company admin

    const isSuperAdminORCompanyAdmin = checkRoles({
      expectedRoles: [RoleEnum.SuperAdmin, RoleEnum.CompanyAdmin],
      userRoles: context?.user?.roles ?? [],
    });

    if (!isSuperAdminORCompanyAdmin) {
      args.input.created_by = created_by;
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

export const canCreateTimeEntry: MiddlewareFn<IGraphqlContext> = async ({ context, args }, next: NextFn) => {
  const operation = 'canCreateTimeEntry';
  const errorService = container.get<IErrorService>(TYPES.ErrorService);

  try {
    const type = context.user?.entryType;
    // Check only if user is not super admin and employee

    const isSuperAdminOREmployee = checkRoles({
      expectedRoles: [RoleEnum.SuperAdmin, RoleEnum.Employee],
      userRoles: context?.user?.roles ?? [],
    });

    if (!isSuperAdminOREmployee || type !== EntryType.Timesheet) {
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
