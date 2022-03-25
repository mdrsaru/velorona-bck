import merge from 'lodash/merge';
import Util from 'util';
import crypto from 'crypto';

import isNil from 'lodash/isNil';
import isString from 'lodash/isString';
import isArray from 'lodash/isArray';
import { injectable, inject } from 'inversify';
import { getRepository, IsNull } from 'typeorm';

import { TYPES } from '../types';
import strings from '../config/strings';
import config, { InvitationStatus } from '../config/constants';
import Invitation from '../entities/invitation.entity';
import BaseRepository from './base.repository';
import * as apiError from '../utils/api-error';

import { IHashService } from '../interfaces/common.interface';
import {
  IInvitation,
  IInvitationCreate,
  IInvitationRepository,
} from '../interfaces/invitation.interface';
import { IClientRepository } from '../interfaces/client.interface';
import { IUserRepository } from '../interfaces/user.interface';

@injectable()
export default class InvitationRepository
  extends BaseRepository<Invitation>
  implements IInvitationRepository
{
  private hashService: IHashService;
  private clientRepository: IClientRepository;
  private userRepository: IUserRepository;

  constructor(
    @inject(TYPES.HashService) _hashService: IHashService,
    @inject(TYPES.ClientRepository) _clientRepository: IClientRepository,
    @inject(TYPES.UserRepository) _userRepository: IUserRepository
  ) {
    super(getRepository(Invitation));
    this.hashService = _hashService;
    this.clientRepository = _clientRepository;
    this.userRepository = _userRepository;
  }

  create = async (args: IInvitationCreate): Promise<Invitation> => {
    try {
      const email = args.email?.toLowerCase()?.trim();
      const inviter_id = args.inviter_id;
      const client_id = args.client_id;

      const errors: string[] = [];

      if (isNil(email) || !isString(email)) {
        errors.push(strings.emailRequired);
      }
      if (isNil(inviter_id) || !isString(inviter_id)) {
        errors.push(strings.inviterRequired);
      }
      if (isNil(client_id) || !isString(client_id)) {
        errors.push(strings.clientRequired);
      }

      const foundUserInClient = await this.userRepository.getAll({
        query: { email, client_id },
      });

      if (foundUserInClient.length) {
        throw new apiError.ConflictError({
          details: [strings.userAlreadyExistsInClient],
        });
      }

      const found = await this.repo.count({ where: { email, client_id } });

      if (found) {
        throw new apiError.ConflictError({
          details: [strings.invitationAlreadyExists],
        });
      }

      const token = await generateToken();
      const invitation = await this.repo.save({
        email,
        client_id,
        inviter_id,
        token,
        status: InvitationStatus.Pending,
      });

      return invitation;
    } catch (err) {
      throw err;
    }
  };
}

function generateToken(): Promise<string> {
  return new Promise((resolve, reject) => {
    resolve(crypto.randomUUID());
  });
}
