import { inject, injectable } from 'inversify';

import { TYPES } from '../types';
import Paging from '../utils/paging';

import { IEntityRemove, IErrorService, ILogger } from '../interfaces/common.interface';
import { IPaginationData, IPagingArgs } from '../interfaces/paging.interface';

import {
  IUserPayRateCreateInput,
  IUserPayRateRepository,
  IUserPayRateService,
  IUserPayRateUpdateInput,
} from '../interfaces/user-payrate.interface';
import UserPayRate from '../entities/user-payrate.entity';

@injectable()
export default class UserPayRateService implements IUserPayRateService {
  private name = 'UserPayRateService';
  private userPayRateRepository: IUserPayRateRepository;
  private logger: ILogger;
  private errorService: IErrorService;

  constructor(
    @inject(TYPES.UserPayRateRepository) userPayRateRepository: IUserPayRateRepository,
    @inject(TYPES.LoggerFactory) loggerFactory: (name: string) => ILogger,
    @inject(TYPES.ErrorService) errorService: IErrorService
  ) {
    this.userPayRateRepository = userPayRateRepository;
    this.logger = loggerFactory(this.name);
    this.errorService = errorService;
  }

  getAllAndCount = async (args: IPagingArgs): Promise<IPaginationData<UserPayRate>> => {
    try {
      const { rows, count } = await this.userPayRateRepository.getAllAndCount(args);

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

  create = async (args: IUserPayRateCreateInput) => {
    const operation = 'create';
    const startDate = args.startDate;
    const endDate = args.endDate;
    const amount = args.amount;
    const user_id = args.user_id;
    const project_id = args.project_id;

    try {
      let userPayRate = await this.userPayRateRepository.create({
        startDate,
        endDate,
        amount,
        user_id,
        project_id,
      });
      return userPayRate;
    } catch (err) {
      this.errorService.throwError({
        err,
        operation,
        name: this.name,
        logError: true,
      });
    }
  };

  update = async (args: IUserPayRateUpdateInput) => {
    const operation = 'update';
    const id = args?.id;
    const startDate = args?.startDate;
    const endDate = args?.endDate;
    const amount = args?.amount;
    const user_id = args?.user_id;
    const project_id = args?.project_id;

    try {
      let userPayRate = await this.userPayRateRepository.update({
        id,
        startDate,
        endDate,
        amount,
        user_id,
        project_id,
      });
      return userPayRate;
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
      const role = await this.userPayRateRepository.remove({
        id,
      });
      return role;
    } catch (err) {
      throw err;
    }
  };
}
