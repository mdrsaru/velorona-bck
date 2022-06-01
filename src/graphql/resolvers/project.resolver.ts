import { inject, injectable } from 'inversify';
import { Arg, Ctx, Mutation, Query, Resolver, UseMiddleware, FieldResolver, Root } from 'type-graphql';

import { TYPES } from '../../types';
import { Role as RoleEnum } from '../../config/constants';
import Paging from '../../utils/paging';
import authenticate from '../middlewares/authenticate';
import authorize from '../middlewares/authorize';
import { checkCompanyAccess } from '../middlewares/company';
import ProjectValidation from '../../validation/project.validation';
import { DeleteInput } from '../../entities/common.entity';
import Project, {
  ProjectCreateInput,
  ProjectPagingResult,
  ProjectQueryInput,
  ProjectUpdateInput,
} from '../../entities/project.entity';

import { IPaginationData } from '../../interfaces/paging.interface';
import { IErrorService, IJoiService } from '../../interfaces/common.interface';
import { IProject, IProjectService } from '../../interfaces/project.interface';
import { IGraphqlContext } from '../../interfaces/graphql.interface';

@injectable()
@Resolver((of) => Project)
export class ProjectResolver {
  private name = 'ProjectResolver';
  private projectService: IProjectService;
  private joiService: IJoiService;
  private errorService: IErrorService;

  constructor(
    @inject(TYPES.ProjectService) _projectService: IProjectService,
    @inject(TYPES.JoiService) _joiService: IJoiService,
    @inject(TYPES.ErrorService) _errorService: IErrorService
  ) {
    this.projectService = _projectService;
    this.joiService = _joiService;
    this.errorService = _errorService;
  }

  @Query((returns) => ProjectPagingResult)
  @UseMiddleware(authenticate, checkCompanyAccess)
  async Project(@Arg('input') args: ProjectQueryInput, @Ctx() ctx: any): Promise<IPaginationData<Project>> {
    const operation = 'Projects';

    try {
      const pagingArgs = Paging.createPagingPayload(args);

      let result: IPaginationData<Project> = await this.projectService.getAllAndCount(pagingArgs);

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

  @Mutation((returns) => Project)
  @UseMiddleware(authenticate, authorize(RoleEnum.SuperAdmin, RoleEnum.CompanyAdmin), checkCompanyAccess)
  async ProjectCreate(@Arg('input') args: ProjectCreateInput, @Ctx() ctx: any): Promise<Project> {
    const operation = 'ProjectCreate';
    try {
      const name = args.name;
      const client_id = args.client_id;
      const company_id = args.company_id;
      const status = args.status;
      const archived = args.archived;

      const schema = ProjectValidation.create();
      await this.joiService.validate({
        schema,
        input: {
          name,
          client_id,
          company_id,
          status,
          archived,
        },
      });

      let project: Project = await this.projectService.create({
        name,
        client_id,
        company_id,
        status,
        archived,
      });

      return project;
    } catch (err) {
      this.errorService.throwError({
        err,
        name: this.name,
        operation,
        logError: false,
      });
    }
  }

  @Mutation((returns) => Project)
  @UseMiddleware(authenticate, authorize(RoleEnum.SuperAdmin, RoleEnum.CompanyAdmin), checkCompanyAccess)
  async ProjectUpdate(@Arg('input') args: ProjectUpdateInput, @Ctx() ctx: any): Promise<IProject> {
    const operation = 'ProjectUpdate';

    try {
      const id = args.id;
      const name = args.name;
      const company_id = args.company_id;
      const status = args.status;
      const archived = args.archived;

      const schema = ProjectValidation.update();
      await this.joiService.validate({
        schema,
        input: {
          id,
          name,
          status,
          archived,
        },
      });

      let project: Project = await this.projectService.update({
        id,
        name,
        status,
        archived,
      });

      return project;
    } catch (err) {
      this.errorService.throwError({
        err,
        name: this.name,
        operation,
        logError: false,
      });
    }
  }

  @FieldResolver()
  company(@Root() root: Project, @Ctx() ctx: IGraphqlContext) {
    return ctx.loaders.companyByIdLoader.load(root.company_id);
  }

  @FieldResolver()
  client(@Root() root: Project, @Ctx() ctx: IGraphqlContext) {
    return ctx.loaders.clientByIdLoader.load(root.client_id);
  }

  @FieldResolver()
  async task(@Root() root: Project, @Ctx() ctx: IGraphqlContext) {
    return await ctx.loaders.tasksByProjectIdLoader.load(root.id);
  }
}
