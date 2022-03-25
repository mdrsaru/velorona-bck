import User from '../entities/user.entity';
import Client from '../entities/client.entity';
import Invitation from '../entities/invitation.entity';
import { InvitationStatus } from '../config/constants';

import {
  IPagingArgs,
  IGetAllAndCountResult,
  IPaginationData,
} from './paging.interface';
import { IEntityRemove, IEntityID } from './common.interface';

export interface IInvitation {
  id: string;
  email: string;
  client_id: string;
  inviter_id: string;
  token: string;
  status: InvitationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface IInvitationCreate {
  email: IInvitation['email'];
  client_id: IInvitation['client_id'];
  inviter_id: IInvitation['inviter_id'];
}

export interface IInvitationRepository {
  getAllAndCount(args: IPagingArgs): Promise<IGetAllAndCountResult<Invitation>>;
  getAll(args: any): Promise<Invitation[]>;
  getById(args: IEntityID): Promise<Invitation | undefined>;
  create(args: IInvitationCreate): Promise<Invitation>;
}

export interface IInvitationService {
  getAllAndCount(args: IPagingArgs): Promise<IPaginationData<Invitation>>;
  create(args: IInvitationCreate): Promise<Invitation>;
}
