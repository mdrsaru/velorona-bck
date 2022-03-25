import { inject, injectable } from 'inversify';
import Role from '../entities/role.entity';
import {
  IEntityID,
  IEntityRemove,
  IErrorService,
  ILogger,
} from '../interfaces/common.interface';
import { IPaginationData, IPagingArgs } from '../interfaces/paging.interface';
import {
  IRoleCreate,
  IRoleRepository,
  IRoleService,
  IRoleUpdate,
} from '../interfaces/role.interface';
import { TYPES } from '../types';
import Paging from '../utils/paging';

@injectable()
export default class RoleService implements IRoleService {
  private name = 'RoleService';
  private roleRepository: IRoleRepository;
  private logger: ILogger;
  private errorService: IErrorService;

  constructor(
    @inject(TYPES.RoleRepository) roleRepository: IRoleRepository,
    @inject(TYPES.LoggerFactory) loggerFactory: (name: string) => ILogger,
    @inject(TYPES.ErrorService) errorService: IErrorService
  ) {
    this.roleRepository = roleRepository;
    this.logger = loggerFactory(this.name);
  }

  getAllAndCount = async (
    args: IPagingArgs
  ): Promise<IPaginationData<Role>> => {
    try {
      const { rows, count } = await this.roleRepository.getAllAndCount(args);

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

  create = async (args: IRoleCreate) => {
    const operation = 'create';
    const name = args.name;
    const description = args.description;

    try {
      let role = await this.roleRepository.create({
        name,
        description,
      });
      return role;
    } catch (err) {
      this.errorService.throwError({
        err,
        operation,
        name: this.name,
        logError: true,
      });
    }
  };
  update = async (args: IRoleUpdate) => {
    const operation = 'update';
    const id = args?.id;
    const name = args?.name;
    const description = args?.description;
    try {
      let role = await this.roleRepository.update({
        id,
        name,
        description,
      });
      return role;
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
      const role = await this.roleRepository.remove({
        id,
      });
      return role;
    } catch (err) {
      throw err;
    }
  };
}
