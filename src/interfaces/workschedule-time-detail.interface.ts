import WorkscheduleDetail from '../entities/workschedule-details.entity';
import WorkscheduleTimeDetail from '../entities/workschedule-time-details.entity';
import { IEntityID, IEntityRemove } from './common.interface';
import { IGetAllAndCountResult, IPaginationData, IPagingArgs } from './paging.interface';
import { string } from 'joi';

export interface IWorkscheduleTimeDetail {
  id: string;
  startTime: Date | undefined;
  endTime: Date | undefined;
  duration: Number;
  workschedule_detail_id: string;
  workscheduleDetail: WorkscheduleDetail[];
}

export interface IWorkscheduleTimeDetailCreateInput {
  startTime: IWorkscheduleTimeDetail['startTime'];
  endTime: IWorkscheduleTimeDetail['endTime'];
  duration: Number;
  workschedule_detail_id: string;
}

export interface IWorkscheduleTimeDetailUpdateInput {
  id: string;
  startTime?: IWorkscheduleTimeDetail['startTime'];
  endTime?: IWorkscheduleTimeDetail['endTime'];
  duration?: Number;
  workschedule_detail_id: string;
}

export interface IWorkscheduleTimeDetailService {
  getAllAndCount(filters?: any): Promise<IPaginationData<WorkscheduleTimeDetail>>;
  update(args: IWorkscheduleTimeDetailUpdateInput): Promise<WorkscheduleTimeDetail>;
  remove(args: IEntityRemove): Promise<WorkscheduleTimeDetail>;
}

export interface IWorkscheduleTimeDetailRepository {
  getAllAndCount(args: IPagingArgs): Promise<IGetAllAndCountResult<WorkscheduleTimeDetail>>;
  getAll(args: any): Promise<WorkscheduleTimeDetail[]>;
  getById(args: IEntityID): Promise<WorkscheduleTimeDetail | undefined>;
  update(args: IWorkscheduleTimeDetailUpdateInput): Promise<WorkscheduleTimeDetail>;
  create(args: IWorkscheduleTimeDetailCreateInput): Promise<WorkscheduleTimeDetail>;
  remove(args: IEntityRemove): Promise<WorkscheduleTimeDetail>;
}
