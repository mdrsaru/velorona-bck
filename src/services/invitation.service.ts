import ms from 'ms';
import { injectable, inject } from 'inversify';

import Paging from '../utils/paging';
import { TYPES } from '../types';
import config from '../config/constants';
import Invitation from '../entities/invitation.entity';

import { IEntityRemove, IEntityID } from '../interfaces/common.interface';
import { IPagingArgs, IPaginationData } from '../interfaces/paging.interface';
import {
  IInvitationCreateInput,
  IInvitationUpdateInput,
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

  getAllAndCount = async (args: IPagingArgs): Promise<IPaginationData<Invitation>> => {
    try {
      const { rows, count } = await this.invitationRepository.getAllAndCount(args);

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

  create = async (args: IInvitationCreateInput): Promise<Invitation> => {
    try {
      const email = args.email;
      const inviter_id = args.inviter_id;
      const client_id = args.client_id;
      const role = args.role;

      const invitation = await this.invitationRepository.create({
        email,
        client_id,
        inviter_id,
        role,
      });

      return invitation;
    } catch (err) {
      throw err;
    }
  };

  renewInvitation = async (args: IInvitationUpdateInput): Promise<Invitation> => {
    try {
      const id = args.id;
      const expiresIn = new Date(Date.now() + ms(config.invitationExpiresIn));

      const invitation = await this.invitationRepository.update({
        id,
        expiresIn,
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
