import { injectable, inject } from 'inversify';
import UserProject from '../entities/user-project.entity';
import { ILogger, IErrorService } from '../interfaces/common.interface';
import { IPagingArgs, IPaginationData } from '../interfaces/paging.interface';
import { IProjectRepository } from '../interfaces/project.interface';
import { IUserClientService } from '../interfaces/user-client.interface';
import {
  IUserProjectChangeStatus,
  IUserProjectRepository,
  IUserProjectService,
} from '../interfaces/user-project.interface';
import { TYPES } from '../types';

import Paging from '../utils/paging';
@injectable()
export default class UserProjectService implements IUserProjectService {
  private name = 'UserProjectkService';
  private userProjectRepository: IUserProjectRepository;
  private userClientService: IUserClientService;
  private projectRepository: IProjectRepository;
  private logger: ILogger;
  private errorService: IErrorService;

  constructor(
    @inject(TYPES.LoggerFactory) loggerFactory: (name: string) => ILogger,
    @inject(TYPES.ErrorService) errorService: IErrorService,
    @inject(TYPES.UserProjectRepository) _userProjectRepository: IUserProjectRepository,
    @inject(TYPES.UserClientService) _userClientService: IUserClientService,
    @inject(TYPES.ProjectRepository) _projectRepository: IProjectRepository
  ) {
    this.userProjectRepository = _userProjectRepository;
    this.userClientService = _userClientService;
    this.projectRepository = _projectRepository;
    this.logger = loggerFactory(this.name);
    this.errorService = errorService;
  }

  getAllAndCount = async (args: IPagingArgs): Promise<IPaginationData<UserProject>> => {
    try {
      const { rows, count } = await this.userProjectRepository.getAllAndCount(args);

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

  changeStatus = async (args: IUserProjectChangeStatus): Promise<UserProject> => {
    const operation = 'changeStatus';

    const user_id = args.user_id;
    const project_id = args.project_id;
    const status = args.status;
    try {
      const userProject = await this.userProjectRepository.update({
        user_id,
        project_id,
        status,
      });

      const project = await this.projectRepository.getById({
        id: project_id,
      });

      const userClient = await this.userClientService.changeStatus({
        user_id,
        client_id: project?.client_id as string,
        status,
      });
      return userProject;
    } catch (err) {
      this.errorService.throwError({
        err,
        operation,
        name: this.name,
        logError: true,
      });
    }
  };
}
