import { MiddlewareFn, NextFn } from 'type-graphql';
import { IGraphqlContext } from '../../interfaces/graphql.interface';
import container from '../../inversify.config';
import { IErrorService } from '../../interfaces/common.interface';
import { TYPES } from '../../types';
import { Role as RoleEnum } from '../../config/constants';
import { checkRoles } from '../../utils/roles';

const name = 'time-entry.middleware';

export const checkRoleAndFilterTimeEntry: MiddlewareFn<IGraphqlContext> = async ({ context, args }, next: NextFn) => {
  const operation = 'hasClientAccess';
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
