import merge from 'lodash/merge';
import isNil from 'lodash/isNil';
import isString from 'lodash/isString';
import { injectable, inject } from 'inversify';
import { getRepository, Repository } from 'typeorm';

import { TYPES } from '../types';
import strings from '../config/strings';
import DemoRequest from '../entities/demo-request.entity';
import BaseRepository from './base.repository';
import * as apiError from '../utils/api-error';

import { IGetAllAndCountResult, IGetOptions } from '../interfaces/paging.interface';
import {
  IDemoRequest,
  IDemoRequestCreateInput,
  IDemoRequestUpdateInput,
  IDemoRequestRepository,
} from '../interfaces/demo-request.interface';

@injectable()
export default class DemoRequestRepository extends BaseRepository<DemoRequest> implements IDemoRequestRepository {
  constructor() {
    super(getRepository(DemoRequest));
  }

  create = async (args: IDemoRequestCreateInput): Promise<DemoRequest> => {
    try {
      const fullName = args.fullName?.trim();
      const email = args.email?.trim()?.toLowerCase();
      const phone = args.phone;
      const jobTitle = args.jobTitle;

      const errors: string[] = [];

      if (isNil(fullName) || !isString(fullName)) {
        errors.push(strings.nameRequired);
      }
      if (isNil(email) || !isString(email)) {
        errors.push(strings.emailRequired);
      }

      if (errors.length) {
        throw new apiError.ValidationError({
          details: errors,
        });
      }

      const found = await this.repo.count({
        where: {
          email,
        },
      });

      if (found) {
        throw new apiError.NotFoundError({
          details: [strings.demoAlreadyRequested],
        });
      }

      const demoRequest = await this.repo.save({
        fullName,
        email,
        phone,
        jobTitle,
      });

      return demoRequest;
    } catch (err) {
      throw err;
    }
  };

  update = async (args: IDemoRequestUpdateInput): Promise<DemoRequest> => {
    try {
      const id = args.id;
      const status = args.status;

      const errors: string[] = [];

      if (isNil(id) && !isString(id)) {
        errors.push(strings.idRequired);
      }

      if (errors.length) {
        throw new apiError.ValidationError({
          details: errors,
        });
      }

      const found = await this.getById({ id });

      if (!found) {
        throw new apiError.NotFoundError({
          details: [strings.demoRequestNotFound],
        });
      }

      const update: DemoRequest = merge(found, {
        id,
        status,
      });

      const demoRequest = await this.repo.save(update);

      return demoRequest;
    } catch (err) {
      throw err;
    }
  };
}
