import { ContainerModule, interfaces } from 'inversify';

import { TYPES } from '../../types';

// interface
import {
  IInvitationService,
  IInvitationRepository,
} from '../../interfaces/invitation.interface';

// C ient
import InvitationRepository from '../../repository/invitation.repository';
import InvitationService from '../../services/invitation.service';

// Resolvers
import { InvitationResolver } from '../../graphql/resolvers/invitation.resolver';

const invitation = new ContainerModule(
  (bind: interfaces.Bind, unbind: interfaces.Unbind) => {
    bind<IInvitationRepository>(TYPES.InvitationRepository).to(
      InvitationRepository
    );
    bind<IInvitationService>(TYPES.InvitationService).to(InvitationService);
    bind<InvitationResolver>(InvitationResolver)
      .to(InvitationResolver)
      .inSingletonScope();
  }
);

export default invitation;
