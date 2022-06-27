import { IPagingArgs, IGetAllAndCountResult, IPaginationData } from './paging.interface';
import User from '../entities/user.entity';
import ActivityLog from '../entities/activity-log.entity';

export interface IActivityLog {
  id: string;
  message: string;
  type: string;
  user_id: string;
  company_id: string;
}
export interface IActivityLogCreateInput {
  type: IActivityLog['type'];
  message: IActivityLog['message'];
  company_id?: IActivityLog['company_id'];
  user_id?: IActivityLog['user_id'];
}

export interface IActivityLogRepository {
  getAllAndCount(args: IPagingArgs): Promise<IGetAllAndCountResult<ActivityLog>>;
  create(args: IActivityLogCreateInput): Promise<ActivityLog>;
}

export interface IActivityLogService {
  getAllAndCount(args: IPagingArgs): Promise<IPaginationData<ActivityLog>>;
}
