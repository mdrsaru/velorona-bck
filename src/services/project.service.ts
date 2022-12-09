import { inject, injectable } from 'inversify';

import { TYPES } from '../types';
import Paging from '../utils/paging';
import Project from '../entities/project.entity';

import { IPaginationData, IPagingArgs } from '../interfaces/paging.interface';
import { IEntityID, IEntityRemove, IErrorService, ILogger } from '../interfaces/common.interface';
import {
  IProjectCreateInput,
  IProjectRepository,
  IProjectService,
  IProjectUpdateInput,
  IRemoveAssignProjectToUsers,
} from '../interfaces/project.interface';

@injectable()
export default class ProjectService implements IProjectService {
  private name = 'ProjectService';
  private projectRepository: IProjectRepository;
  private logger: ILogger;
  private errorService: IErrorService;

  constructor(
    @inject(TYPES.ProjectRepository) _projectRepository: IProjectRepository,
    @inject(TYPES.LoggerFactory) loggerFactory: (name: string) => ILogger,
    @inject(TYPES.ErrorService) _errorService: IErrorService
  ) {
    this.projectRepository = _projectRepository;
    this.logger = loggerFactory(this.name);
    this.errorService = _errorService;
  }

  getAllAndCount = async (args: IPagingArgs): Promise<IPaginationData<Project>> => {
    try {
      const { rows, count } = await this.projectRepository.getAllAndCount(args);

      const paging = Paging.getPagingResult({
        ...args,
        total: count,
      });

      return {
        paging,
        data: rows,
      };
    } catch (err) {
      throw err;
    }
  };

  create = async (args: IProjectCreateInput) => {
    const operation = 'create';
    const name = args.name;
    const client_id = args.client_id;
    const company_id = args.company_id;
    const status = args.status;
    const archived = args.archived;
    const user_ids = args.user_ids;

    try {
      const project = await this.projectRepository.create({
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
        operation,
        name: this.name,
        logError: true,
      });
    }
  };

  update = async (args: IProjectUpdateInput) => {
    const operation = 'update';
    const id = args?.id;
    const name = args?.name;
    const status = args?.status;
    const archived = args?.archived;
    const user_ids = args.user_ids;
    const client_id = args.client_id;

    if (user_ids) {
      await this.projectRepository.assignProjectToUsers({
        user_id: user_ids,
        project_id: id,
      });
    }
    try {
      let project = await this.projectRepository.update({
        id,
        name,
        status,
        archived,
        user_ids,
        client_id,
      });

      return project;
    } catch (err) {
      this.errorService.throwError({
        err,
        operation,
        name: this.name,
        logError: true,
      });
    }
  };

  remove = async (args: IEntityRemove) => {
    try {
      const id = args.id;

      const project = await this.projectRepository.remove({
        id,
      });

      return project;
    } catch (err) {
      throw err;
    }
  };

  async removeAssignProjectToUsers(args: IRemoveAssignProjectToUsers): Promise<Project> {
    try {
      const user_id = args.user_id;
      const project_id = args.project_id;

      const project: any = await this.projectRepository.removeAssignProjectToUsers({
        user_id,
        project_id,
      });
      return project;
    } catch (err) {
      throw err;
    }
  }
}
