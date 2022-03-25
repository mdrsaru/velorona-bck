import container from '../../../inversify.config';
import { TYPES } from '../../../types';

import strings from '../../../config/strings';
import * as apiError from '../../../utils/api-error';
import InvitationRepository from '../../mock/invitation.repository';
import {
  IInvitationRepository,
  IInvitationService,
  IInvitationCreate,
} from '../../../interfaces/invitation.interface';
import { invitations } from '../../mock/data';

describe('Invitation Service', () => {
  let invitationService: IInvitationService;
  beforeAll(() => {
    container
      .rebind<IInvitationRepository>(TYPES.InvitationRepository)
      .to(InvitationRepository);
    invitationService = container.get<IInvitationService>(
      TYPES.InvitationService
    );
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

  describe('create', () => {
    it('should throw conflict validation if the user is already invited to the same client', () => {});

    it('should create a new invitation', () => {});
  });
});
