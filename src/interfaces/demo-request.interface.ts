import { IPagingArgs, IGetAllAndCountResult, IPaginationData, IGetOptions } from './paging.interface';
import { IEntityID, IEntityRemove, ISingleEntityQuery } from './common.interface';
import { IAddressInput } from './address.interface';
import DemoRequest from '../entities/demo-request.entity';
import { DemoRequestStatus } from '../config/constants';

export interface IDemoRequest {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  jobTitle?: string;
  status: DemoRequestStatus;
}

export interface IDemoRequestCreateInput {
  fullName: IDemoRequest['fullName'];
  email: IDemoRequest['email'];
  phone?: IDemoRequest['phone'];
  jobTitle?: IDemoRequest['phone'];
  status?: IDemoRequest['status'];
}

export interface IDemoRequestUpdateInput {
  id: string;
  status: IDemoRequest['status'];
}

export interface IDemoRequestRepository {
  getAllAndCount(args: IPagingArgs): Promise<IGetAllAndCountResult<DemoRequest>>;
  getAll(args: any): Promise<DemoRequest[]>;
  getSingleEntity(args: ISingleEntityQuery): Promise<DemoRequest | undefined>;
  getById(args: IEntityID): Promise<DemoRequest | undefined>;
  create(args: IDemoRequestCreateInput): Promise<DemoRequest>;
  update(args: IDemoRequestUpdateInput): Promise<DemoRequest>;
  remove(args: IEntityRemove): Promise<DemoRequest>;
}

export interface IDemoRequestService {
  getAllAndCount(args: IPagingArgs): Promise<IPaginationData<DemoRequest>>;
  create(args: IDemoRequestCreateInput): Promise<DemoRequest>;
  update(args: IDemoRequestUpdateInput): Promise<DemoRequest>;
  remove(args: IEntityRemove): Promise<DemoRequest>;
}
