import container from '../../../inversify.config';
import { TYPES } from '../../../types';

import { invitations } from '../../mock/data';
import strings from '../../../config/strings';
import * as apiError from '../../../utils/api-error';
import InvitationRepository from '../../mock/invitation.repository';
import SendGridService from '../../mock/sendgrid.service';

import {
  IInvitationRepository,
  IInvitationService,
  IInvitationCreateInput,
} from '../../../interfaces/invitation.interface';
import { IEmailService } from '../../../interfaces/common.interface';

describe('Invitation Service', () => {
  let invitationService: IInvitationService;
  beforeAll(() => {
    container.rebind<IInvitationRepository>(TYPES.InvitationRepository).to(InvitationRepository);
    container.rebind<IEmailService>(TYPES.EmailService).to(SendGridService);
    invitationService = container.get<IInvitationService>(TYPES.InvitationService);
  });

  afterAll(() => {
    container.unbindAll();
  });

  describe('getAllAndCount', () => {
    it('should have a defined invitation service instance', () => {
      expect(invitationService).toBeDefined();
    });

    it('should return invitations with pagination', async () => {
      const _invitations = await invitationService.getAllAndCount({});

      expect(_invitations).toBeDefined();
      expect(_invitations.data.length).toBe(invitations.length);
    });
  });
});
