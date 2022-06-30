import { inject, injectable } from 'inversify';
import { IActivityLogRepository, IActivityLogService } from '../interfaces/activity-log.interface';
import { IErrorService, ILogger } from '../interfaces/common.interface';
import { IPaginationData, IPagingArgs } from '../interfaces/paging.interface';
import { TYPES } from '../types';
import ActivityLog from '../entities/activity-log.entity';
import Paging from '../utils/paging';

@injectable()
export default class ActivityLogService implements IActivityLogService {
  private name = 'ProjectService';
  private activityLogRepository: IActivityLogRepository;
  private logger: ILogger;
  private errorService: IErrorService;

  constructor(
    @inject(TYPES.ActivityLogRepository) _activityLogRepository: IActivityLogRepository,
    @inject(TYPES.LoggerFactory) loggerFactory: (name: string) => ILogger,
    @inject(TYPES.ErrorService) _errorService: IErrorService
  ) {
    this.activityLogRepository = _activityLogRepository;
    this.logger = loggerFactory(this.name);
    this.errorService = _errorService;
  }

  getAllAndCount = async (args: IPagingArgs): Promise<IPaginationData<ActivityLog>> => {
    try {
      const { rows, count } = await this.activityLogRepository.getAllAndCount(args);

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
}
