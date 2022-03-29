import User from '../entities/user.entity';
import Company from '../entities/company.entity';
import Invitation from '../entities/invitation.entity';
import { InvitationStatus, Role as RoleEnum } from '../config/constants';
import { ISingleEntityQuery } from './common.interface';

import { IPagingArgs, IGetAllAndCountResult, IPaginationData } from './paging.interface';
import { IEntityRemove, IEntityID } from './common.interface';

export interface IInvitation {
  id: string;
  email: string;
  company_id: string;
  inviter_id: string;
  token: string;
  role: RoleEnum;
  status: InvitationStatus;
  expiresIn: Date;
  createdAt: string;
  updatedAt: string;
}

export interface IInvitationCreateInput {
  email: IInvitation['email'];
  company_id: IInvitation['company_id'];
  inviter_id: IInvitation['inviter_id'];
  role: IInvitation['role'];
}

export interface IInvitationUpdateInput {
  id: IInvitation['id'];
  status?: IInvitation['status'];
  expiresIn?: IInvitation['expiresIn'];
}

export interface IInvitationRenew {
  id: IInvitation['id'];
}

export interface IInvitationRepository {
  getSingleEntity(args: ISingleEntityQuery): Promise<Invitation | undefined>;
  getAllAndCount(args: IPagingArgs): Promise<IGetAllAndCountResult<Invitation>>;
  getAll(args: any): Promise<Invitation[]>;
  getById(args: IEntityID): Promise<Invitation | undefined>;
  create(args: IInvitationCreateInput): Promise<Invitation>;
  update(args: IInvitationUpdateInput): Promise<Invitation>;
}

export interface IInvitationService {
  getAllAndCount(args: IPagingArgs): Promise<IPaginationData<Invitation>>;
  create(args: IInvitationCreateInput): Promise<Invitation>;
  renewInvitation(args: IInvitationRenew): Promise<Invitation>;
}
