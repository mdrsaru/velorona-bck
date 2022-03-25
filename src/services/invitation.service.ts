import { injectable, inject } from 'inversify';

import Paging from '../utils/paging';
import { TYPES } from '../types';
import Invitation from '../entities/invitation.entity';

import { IEntityRemove, IEntityID } from '../interfaces/common.interface';
import { IPagingArgs, IPaginationData } from '../interfaces/paging.interface';
import {
  IInvitationCreate,
  IInvitationService,
  IInvitationRepository,
} from '../interfaces/invitation.interface';

@injectable()
export default class InvitationService implements IInvitationService {
  private invitationRepository: IInvitationRepository;

  constructor(
    @inject(TYPES.InvitationRepository)
    _invitationRepository: IInvitationRepository
  ) {
    this.invitationRepository = _invitationRepository;
  }

  getAllAndCount = async (
    args: IPagingArgs
  ): Promise<IPaginationData<Invitation>> => {
    try {
      const { rows, count } = await this.invitationRepository.getAllAndCount(
        args
      );

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

  create = async (args: IInvitationCreate): Promise<Invitation> => {
    try {
      const email = args.email;
      const inviter_id = args.inviter_id;
      const client_id = args.client_id;

      const invitation = await this.invitationRepository.create({
        email,
        client_id,
        inviter_id,
      });

      return invitation;
    } catch (err) {
      throw err;
    }
  };

  remove = (args: IEntityRemove): Promise<Invitation> => {
    throw new Error('not implemented');
  };
}
