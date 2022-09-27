import { IEntityID, IEntityRemove, ISingleEntityQuery } from './common.interface';
import { IGetAllAndCountResult, IGetOptions, IPagingArgs } from './paging.interface';
import BreakTime from '../entities/break-time.entity';

export interface IBreakTime {
  id: string;
  startTime: Date;
  endTime: Date;
  duration: number;
  time_entry_id?: string;
}

export interface IBreakActiveInput {
  time_entry_id: string;
}

export interface IBreakTimeCreateInput {
  startTime: IBreakTime['startTime'];
  endTime?: IBreakTime['endTime'];
  time_entry_id?: IBreakTime['time_entry_id'];
}

export interface IBreakTimeUpdateInput {
  id: IBreakTime['id'];
  startTime?: IBreakTime['startTime'];
  endTime?: IBreakTime['endTime'];
  time_entry_id?: IBreakTime['time_entry_id'];
  duration: IBreakTime['duration'];
}

export interface IBreakTimeRepository {
  getAllAndCount(args: IPagingArgs): Promise<IGetAllAndCountResult<BreakTime>>;
  getAll(args: any): Promise<BreakTime[]>;
  getSingleEntity(args: ISingleEntityQuery): Promise<BreakTime | undefined>;
  getById(args: IEntityID): Promise<BreakTime | undefined>;
  create(args: IBreakTimeCreateInput): Promise<BreakTime>;
  update(args: IBreakTimeUpdateInput): Promise<BreakTime>;
  remove(args: IEntityRemove): Promise<BreakTime>;
  /**
   * Get active time entry. i.e entry of user for which end_time is null
   */
  getActiveBreak(args: IBreakActiveInput): Promise<BreakTime | undefined>;
}
