import User from '../entities/user.entity';
import WorkscheduleDetail from '../entities/workschedule-details.entity';
import Workschedule from '../entities/workschedule.entity';
import { IEntityID, IEntityRemove } from './common.interface';
import { IGetAllAndCountResult, IPaginationData, IPagingArgs } from './paging.interface';

export interface IWorkscheduleDetail {
  id: string;
  schedule_date: Date;
  timeDetail: string[];
  total: Number;
  workschedule_id: string;
  user_id: string;
  user: User[];
  workschedule: Workschedule[];
}
export interface IWorkscheduleDetailCreateInput {
  schedule_date: IWorkscheduleDetail['schedule_date'];
  startTime?: Date | undefined;
  endTime?: Date | undefined;
  duration?: Number;
  workschedule_id: IWorkscheduleDetail['workschedule_id'];
  user_id: IWorkscheduleDetail['user_id'];
}

export interface IWorkscheduleDetailUpdateInput {
  id: string;
  schedule_date?: IWorkscheduleDetail['schedule_date'];
  startTime?: Date | undefined;
  endTime?: Date | undefined;
  duration?: Number;
  workschedule_id?: IWorkscheduleDetail['workschedule_id'];
  user_id?: IWorkscheduleDetail['user_id'];
}

export interface IWorkscheduleDetailService {
  getAllAndCount(filters?: any): Promise<IPaginationData<WorkscheduleDetail>>;
  create(args: IWorkscheduleDetailCreateInput): Promise<WorkscheduleDetail>;
  update(args: IWorkscheduleDetailUpdateInput): Promise<WorkscheduleDetail>;
  remove(args: IEntityRemove): Promise<WorkscheduleDetail>;
}

export interface IWorkscheduleDetailRepository {
  getAllAndCount(args: IPagingArgs): Promise<IGetAllAndCountResult<WorkscheduleDetail>>;
  getAll(args: any): Promise<WorkscheduleDetail[]>;
  getById(args: IEntityID): Promise<WorkscheduleDetail | undefined>;
  create(args: IWorkscheduleDetailCreateInput): Promise<WorkscheduleDetail>;
  update(args: IWorkscheduleDetailUpdateInput): Promise<WorkscheduleDetail>;
  remove(args: IEntityRemove): Promise<WorkscheduleDetail>;
}
