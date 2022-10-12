import set from 'lodash/set';
import { inject, injectable } from 'inversify';
import { Arg, Ctx, Mutation, Query, Resolver, UseMiddleware, FieldResolver, Root } from 'type-graphql';

import { TYPES } from '../../types';
import { Role as RoleEnum, UserClientStatus } from '../../config/constants';
import { checkRoles } from '../../utils/roles';
import Paging from '../../utils/paging';
import authenticate from '../middlewares/authenticate';
import authorize from '../middlewares/authorize';
import { checkCompanyAccess } from '../middlewares/company';
import ProjectValidation from '../../validation/project.validation';
import { DeleteInput } from '../../entities/common.entity';
import Project, {
  ActiveProjectCountInput,
  ProjectCountInput,
  ProjectCreateInput,
  ProjectPagingResult,
  ProjectQueryInput,
  ProjectUpdateInput,
  ProjectItem,
  ProjectItemInput,
} from '../../entities/project.entity';

import { IPaginationData } from '../../interfaces/paging.interface';
import { IGraphqlContext } from '../../interfaces/graphql.interface';
import { IErrorService, IJoiService } from '../../interfaces/common.interface';
import { IUserClientRepository } from '../../interfaces/user-client.interface';
import { IProject, IProjectRepository, IProjectService } from '../../interfaces/project.interface';
import { ITimeEntryRepository } from '../../interfaces/time-entry.interface';

@injectable()
@Resolver((of) => Project)
export class ProjectResolver {
  private name = 'ProjectResolver';
  private projectService: IProjectService;
  private joiService: IJoiService;
  private errorService: IErrorService;
  private projectRepository: IProjectRepository;
  private userClientRepository: IUserClientRepository;
  private timeEntryRepository: ITimeEntryRepository;

  constructor(
    @inject(TYPES.ProjectService) _projectService: IProjectService,
    @inject(TYPES.JoiService) _joiService: IJoiService,
    @inject(TYPES.ErrorService) _errorService: IErrorService,
    @inject(TYPES.ProjectRepository) _projectRepository: IProjectRepository,
    @inject(TYPES.UserClientRepository) _userClientRepository: IUserClientRepository,
    @inject(TYPES.TimeEntryRepository) _timeEntryRepository: ITimeEntryRepository
  ) {
    this.projectService = _projectService;
    this.joiService = _joiService;
    this.errorService = _errorService;
    this.projectRepository = _projectRepository;
    this.userClientRepository = _userClientRepository;
    this.timeEntryRepository = _timeEntryRepository;
  }

  @Query((returns) => ProjectPagingResult)
  @UseMiddleware(authenticate, checkCompanyAccess)
  async Project(@Arg('input') args: ProjectQueryInput, @Ctx() ctx: IGraphqlContext): Promise<IPaginationData<Project>> {
    const operation = 'Projects';

    // Filter projects for employee
    const isEmployee = checkRoles({
      expectedRoles: [RoleEnum.Employee],
      userRoles: ctx?.user?.roles ?? [],
    });

    if (isEmployee) {
      const userClient = await this.userClientRepository.getSingleEntity({
        query: {
          user_id: ctx.user!.id,
          status: UserClientStatus.Active,
        },
      });

      set(args, 'query.client_id', userClient?.client_id);
    }

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

  @Query((returns) => [ProjectItem])
  @UseMiddleware(authenticate, checkCompanyAccess)
  async ProjectItems(@Arg('input') args: ProjectItemInput): Promise<ProjectItem[]> {
    const operation = 'ProjectItems';

    try {
      let projectItems = await this.timeEntryRepository.getProjectItems(args);

      return projectItems;
    } catch (err) {
      this.errorService.throwError({
        err,
        name: this.name,
        operation,
        logError: true,
      });
    }
  }

  @Query((returns) => Number)
  @UseMiddleware(authenticate, checkCompanyAccess)
  async ProjectCount(@Arg('input', { nullable: true }) args: ProjectCountInput, @Ctx() ctx: any): Promise<Number> {
    const operation = 'Project Count';
    try {
      let result: Number = await this.projectRepository.countEntities({ query: args });
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

  @Query((returns) => Number)
  @UseMiddleware(authenticate, checkCompanyAccess)
  async ProjectInvolvedCount(
    @Arg('input', { nullable: true }) args: ProjectCountInput,
    @Ctx() ctx: any
  ): Promise<Number> {
    const operation = 'Project Involved Count';
    try {
      let result: Number = await this.projectRepository.countProjectInvolved(args);
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

  @Query((returns) => Number)
  @UseMiddleware(authenticate, checkCompanyAccess)
  async ActiveProjectInvolvedCount(
    @Arg('input', { nullable: true }) args: ActiveProjectCountInput,
    @Ctx() ctx: any
  ): Promise<Number> {
    const operation = 'Project Involved Count';
    try {
      let result: Number = await this.projectRepository.countActiveProjectInvolved(args);
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
      const user_ids = args?.user_ids;

      const schema = ProjectValidation.create();
      await this.joiService.validate({
        schema,
        input: {
          name,
          client_id,
          company_id,
          status,
          archived,
          user_ids,
        },
      });

      let project: Project = await this.projectService.create({
        name,
        client_id,
        company_id,
        status,
        archived,
        user_ids,
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
      const user_ids = args.user_ids;

      const schema = ProjectValidation.update();
      await this.joiService.validate({
        schema,
        input: {
          id,
          name,
          status,
          archived,
          user_ids,
        },
      });

      let project: Project = await this.projectService.update({
        id,
        name,
        status,
        archived,
        user_ids,
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
  async users(@Root() root: Project, @Ctx() ctx: IGraphqlContext) {
    return ctx.loaders.usersByProjectIdLoader.load(root.id);
  }
}
