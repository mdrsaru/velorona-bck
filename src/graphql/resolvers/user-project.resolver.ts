import { inject, injectable } from 'inversify';
import { Resolver, Mutation, UseMiddleware, Arg, Ctx, Query } from 'type-graphql';

import { Role as RoleEnum } from '../../config/constants';

import UserProject, {
  UserProjectChangeStatusInput,
  UserProjectDetail,
  UserProjectPagingResult,
  UserProjectQueryInput,
} from '../../entities/user-project.entity';
import { IErrorService } from '../../interfaces/common.interface';
import { IGraphqlContext } from '../../interfaces/graphql.interface';
import { IPaginationData } from '../../interfaces/paging.interface';
import { IUserProjectService } from '../../interfaces/user-project.interface';
import { TYPES } from '../../types';
import authenticate from '../middlewares/authenticate';
import authorize from '../middlewares/authorize';
import { checkCompanyAccess } from '../middlewares/company';

@injectable()
@Resolver((of) => UserProject)
export class UserProjectResolver {
  private name = 'UserProjectResolver';
  private userProjectService: IUserProjectService;
  private errorService: IErrorService;

  constructor(
    @inject(TYPES.UserProjectService) userProjectService: IUserProjectService,
    @inject(TYPES.ErrorService) errorService: IErrorService
  ) {
    this.userProjectService = userProjectService;
    this.errorService = errorService;
  }

  @Query((returns) => [UserProjectDetail])
  @UseMiddleware(authenticate)
  async UserProjectDetail(
    @Arg('input') args: UserProjectQueryInput,
    @Ctx() ctx: IGraphqlContext
  ): Promise<UserProjectDetail[]> {
    const operation = 'UserProject';

    const user_id = args.query.user_id;
    const client_id = args.query.client_id;
    try {
      let result: any = await this.userProjectService.getDetails({
        user_id,
        client_id,
      });
      return result;
    } catch (err) {
      this.errorService.throwError({
        err,
        name: this.name,
        operation,
        logError: true,
      });
    }
  }

  @Mutation((returns) => UserProject, { description: 'Associate user with project' })
  @UseMiddleware(authenticate, authorize(RoleEnum.SuperAdmin, RoleEnum.CompanyAdmin), checkCompanyAccess)
  async UserProjectChangeStatus(@Arg('input') args: UserProjectChangeStatusInput): Promise<UserProject> {
    const operation = 'UserProjectChangeStatus';

    try {
      const user_id = args.user_id;
      const project_id = args.project_id;
      const status = args.status;

      const userProject: UserProject = await this.userProjectService.changeStatus({
        user_id,
        status,
        project_id,
      });

      return userProject;
    } catch (err) {
      throw err;
    }
  }
}
