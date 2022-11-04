import { ContainerModule, interfaces } from 'inversify';

import { TYPES } from '../../types';

import { IBlockedEmailsRepository } from '../../interfaces/common.interface';
import BlockedEmailsRepository from '../../repository/blocked-emails.repository';

const blockedEmails = new ContainerModule((bind: interfaces.Bind, unbind: interfaces.Unbind) => {
  bind<IBlockedEmailsRepository>(TYPES.BlockedEmailsRepository).to(BlockedEmailsRepository);
});

export default blockedEmails;
