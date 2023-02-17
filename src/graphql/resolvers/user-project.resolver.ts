import { inject, injectable } from 'inversify';
import { Resolver, Mutation, UseMiddleware, Arg } from 'type-graphql';

import { Role as RoleEnum } from '../../config/constants';

import UserProject, { UserProjectChangeStatusInput } from '../../entities/user-project.entity';
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

  constructor(@inject(TYPES.UserProjectService) userProjectService: IUserProjectService) {
    this.userProjectService = userProjectService;
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
