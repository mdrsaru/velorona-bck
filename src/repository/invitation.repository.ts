import merge from 'lodash/merge';
import isDate from 'lodash/isDate';
import Util from 'util';
import crypto from 'crypto';
import ms from 'ms';

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

import { IHashService, ISingleEntityQuery } from '../interfaces/common.interface';
import {
  IInvitation,
  IInvitationCreateInput,
  IInvitationUpdateInput,
  IInvitationRepository,
} from '../interfaces/invitation.interface';
import { ICompanyRepository } from '../interfaces/company.interface';
import { IUserRepository } from '../interfaces/user.interface';

@injectable()
export default class InvitationRepository extends BaseRepository<Invitation> implements IInvitationRepository {
  private hashService: IHashService;
  private companyRepository: ICompanyRepository;
  private userRepository: IUserRepository;

  constructor(
    @inject(TYPES.HashService) _hashService: IHashService,
    @inject(TYPES.CompanyRepository) _companyRepository: ICompanyRepository,
    @inject(TYPES.UserRepository) _userRepository: IUserRepository
  ) {
    super(getRepository(Invitation));
    this.hashService = _hashService;
    this.companyRepository = _companyRepository;
    this.userRepository = _userRepository;
  }

  getSingleEntity = async (args: ISingleEntityQuery): Promise<Invitation | undefined> => {
    try {
      const query = args.query;

      const row = await this.repo.findOne({
        where: args.query,
        relations: args?.relations ?? [],
      });

      return row;
    } catch (err) {
      throw err;
    }
  };

  create = async (args: IInvitationCreateInput): Promise<Invitation> => {
    try {
      const email = args.email?.toLowerCase()?.trim();
      const inviter_id = args.inviter_id;
      const company_id = args.company_id;
      const role = args.role;

      const errors: string[] = [];

      if (isNil(email) || !isString(email)) {
        errors.push(strings.emailRequired);
      }
      if (isNil(inviter_id) || !isString(inviter_id)) {
        errors.push(strings.inviterRequired);
      }
      if (isNil(company_id) || !isString(company_id)) {
        errors.push(strings.companyRequired);
      }
      if (isNil(role) || !isString(role)) {
        errors.push(strings.roleRequired);
      }

      const foundUserInCompany = await this.userRepository.getAll({
        query: { email, company_id },
      });

      if (foundUserInCompany.length) {
        throw new apiError.ConflictError({
          details: [strings.userAlreadyExistsInCompany],
        });
      }

      const found = await this.repo.count({ where: { email, company_id } });

      if (found) {
        throw new apiError.ConflictError({
          details: [strings.invitationAlreadyExists],
        });
      }

      const token = await generateToken();
      const expiresIn = new Date(Date.now() + ms(config.invitationExpiresIn));
      const invitation = await this.repo.save({
        email,
        company_id,
        inviter_id,
        token,
        role,
        expiresIn,
        status: InvitationStatus.Pending,
      });

      return invitation;
    } catch (err) {
      throw err;
    }
  };

  update = async (args: IInvitationUpdateInput): Promise<Invitation> => {
    try {
      const id = args.id;
      const status = args.status;
      const expiresIn = args.expiresIn;

      const errors: string[] = [];

      if (isNil(id) || !isString(id)) {
        errors.push(strings.idRequired);
      }

      if (!isNil(expiresIn) && !isDate(expiresIn)) {
        errors.push(strings.expiresInNotValid);
      }

      const found = await this.repo.findOne(id);

      if (!found) {
        throw new apiError.NotFoundError({
          details: [strings.invitationNotFound],
        });
      }

      const update = merge(found, {
        status,
        expiresIn,
      });

      const invitation = await this.repo.save(update);

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
