import { injectable } from 'inversify';
import find from 'lodash/find';

import { IInvitationRepository } from '../../interfaces/invitation.interface';

import config, { InvitationStatus } from '../../config/constants';
import strings from '../../config/strings';
import Invitation from '../../entities/invitation.entity';
import { IEntityID, IEntityRemove } from '../../interfaces/common.interface';
import {
  IInvitation,
  IInvitationCreate,
} from '../../interfaces/invitation.interface';
import {
  IPaginationData,
  IPagingArgs,
  IGetAllAndCountResult,
} from '../../interfaces/paging.interface';
import Paging from '../../utils/paging';
import { ConflictError, NotFoundError } from '../../utils/api-error';
import { invitations, clients, users } from './data';
import { generateUuid } from './utils';

const date = '2022-03-08T08:01:04.776Z';

@injectable()
export default class InvitationRepository implements IInvitationRepository {
  getAllAndCount = (
    args: IPagingArgs
  ): Promise<IGetAllAndCountResult<Invitation>> => {
    return Promise.resolve({
      count: invitations.length,
      rows: invitations as Invitation[],
    });
  };

  getAll = (args: any): Promise<Invitation[]> => {
    throw new Error('not implemented');
  };

  getById = (args: IEntityID): Promise<Invitation | undefined> => {
    throw new Error('not implemented');
  };

  create = (args: IInvitationCreate): Promise<Invitation> => {
    try {
      if (
        find(invitations, { email: args.email, client: { id: args.client_id } })
      ) {
        throw new ConflictError({
          details: [strings.invitationAlreadyExists],
        });
      }

      const invitation = new Invitation();

      invitation.id = generateUuid();
      invitation.email = args.email;
      invitation.client = find(clients, { id: args.client_id });
      invitation.inviter = find(users, { id: args.inviter_id });
      invitation.status = InvitationStatus.Pending;
      invitation.createdAt = new Date();
      invitation.updatedAt = new Date();

      invitations.push(invitation);

      return Promise.resolve(invitation);
    } catch (err) {
      throw err;
    }
  };

  remove = (args: IEntityRemove): Promise<Invitation> => {
    throw new Error('not implemented');
  };
}
