import { inject, injectable } from 'inversify';
import { merge } from 'lodash';
import { getRepository } from 'typeorm';

import strings from '../config/strings';
import { IEntityID } from '../interfaces/common.interface';
import { TYPES } from '../types';
import { NotFoundError, ValidationError } from '../utils/api-error';
import BaseRepository from './base.repository';

import { ICompanyRepository } from '../interfaces/company.interface';
import { IMediaRepository } from '../interfaces/media.interface';

import AttachedTimesheet from '../entities/attached-timesheet.entity';
import {
  IAttachedTimesheetCreateInput,
  IAttachedTimesheetRepository,
  IAttachedTimesheetUpdateInput,
} from '../interfaces/attached-timesheet.interface';

@injectable()
export default class AttachedTimesheetRepository
  extends BaseRepository<AttachedTimesheet>
  implements IAttachedTimesheetRepository
{
  private mediaRepository: IMediaRepository;
  private companyRepository: ICompanyRepository;

  constructor(
    @inject(TYPES.MediaRepository) _mediaRepository: IMediaRepository,
    @inject(TYPES.CompanyRepository) _companyRepository: ICompanyRepository
  ) {
    super(getRepository(AttachedTimesheet));
    this.mediaRepository = _mediaRepository;
    this.companyRepository = _companyRepository;
  }

  async create(args: IAttachedTimesheetCreateInput): Promise<AttachedTimesheet> {
    try {
      const description = args.description;
      const date = args.date;
      const totalCost = args.totalCost;
      const attachment_id = args.attachment_id;
      const company_id = args.company_id;

      const company = await this.companyRepository.getById({ id: company_id });
      if (!company) {
        throw new NotFoundError({
          details: [strings.companyNotFound],
        });
      }

      const attachedTimesheet = await this.repo.save({
        description,
        totalCost,
        date,
        company_id,
        attachment_id,
      });

      return attachedTimesheet;
    } catch (err) {
      throw err;
    }
  }

  update = async (args: IAttachedTimesheetUpdateInput): Promise<AttachedTimesheet> => {
    try {
      const id = args.id;
      const description = args?.description;
      const date = args?.date;
      const totalCost = args?.totalCost;
      const attachment_id = args?.attachment_id;

      const found = await this.getById({ id });

      if (!found) {
        throw new NotFoundError({
          details: ['Attached Timesheet not found'],
        });
      }

      const update = merge(found, {
        id,
        description,
        totalCost,
        date,
        attachment_id,
      });

      let attachedTimesheet = await this.repo.save(update);

      return attachedTimesheet;
    } catch (err) {
      throw err;
    }
  };
}
