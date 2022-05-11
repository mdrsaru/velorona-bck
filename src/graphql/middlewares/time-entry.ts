import { MiddlewareFn, NextFn } from 'type-graphql';
import { IGraphqlContext } from '../../interfaces/graphql.interface';
import { isCompanyAdmin, isSuperAdmin } from '../../utils/roles';
import * as apiError from '../../utils/api-error';
import container from '../../inversify.config';
import { IErrorService } from '../../interfaces/common.interface';
import { TYPES } from '../../types';
import strings from '../../config/strings';
import { ITimeEntryRepository } from '../../interfaces/time-entry.interface';
import { timeEntry } from '../../config/db/columns';
import { In } from 'typeorm';

const name = 'time-entry.middleware';

export const checkRoleAndFilterTimeEntry: MiddlewareFn<IGraphqlContext> = async ({ context, args }, next: NextFn) => {
  const operation = 'hasClientAccess';
  const errorService = container.get<IErrorService>(TYPES.ErrorService);
  const timeEntryRepo = container.get<ITimeEntryRepository>(TYPES.TimeEntryRepository);

  try {
    const roles = context.user?.roles ?? [];
    const created_by = context.user?.id ?? [];

    let ids = args.input.ids;
    // check the users's company_id with the input company_id(both for query as well as mutation)

    // Check only if user is not super admin and company admin
    if (!isSuperAdmin({ roles }) && !isCompanyAdmin({ roles })) {
      const query = { created_by, id: ids };
      const res = await timeEntryRepo.getAll({ query });

      ids = res.map((res) => res.id);
      args.input.ids = ids;
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
