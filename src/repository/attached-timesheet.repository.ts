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
import { IUserRepository } from '../interfaces/user.interface';
import { ITimesheetRepository } from '../interfaces/timesheet.interface';

@injectable()
export default class AttachedTimesheetRepository
  extends BaseRepository<AttachedTimesheet>
  implements IAttachedTimesheetRepository
{
  private mediaRepository: IMediaRepository;
  private companyRepository: ICompanyRepository;
  private userRepository: IUserRepository;
  private timesheetRepository: ITimesheetRepository;

  constructor(
    @inject(TYPES.MediaRepository) _mediaRepository: IMediaRepository,
    @inject(TYPES.CompanyRepository) _companyRepository: ICompanyRepository,
    @inject(TYPES.UserRepository) _userRepository: IUserRepository,
    @inject(TYPES.TimesheetRepository) _timesheetRepository: ITimesheetRepository
  ) {
    super(getRepository(AttachedTimesheet));
    this.mediaRepository = _mediaRepository;
    this.companyRepository = _companyRepository;
    this.userRepository = _userRepository;
    this.timesheetRepository = _timesheetRepository;
  }

  async create(args: IAttachedTimesheetCreateInput): Promise<AttachedTimesheet> {
    try {
      const description = args.description;
      const attachment_id = args.attachment_id;
      const company_id = args.company_id;
      const created_by = args.created_by;
      const timesheet_id = args.timesheet_id;
      const invoice_id = args.invoice_id;

      const company = await this.companyRepository.getById({ id: company_id });
      if (!company) {
        throw new NotFoundError({
          details: [strings.companyNotFound],
        });
      }

      const creator = await this.userRepository.getById({ id: created_by });
      if (!creator) {
        throw new NotFoundError({
          details: [strings.userNotFound],
        });
      }

      const timesheet = await this.timesheetRepository.getById({ id: timesheet_id });
      if (!timesheet) {
        throw new NotFoundError({
          details: [strings.timesheetNotFound],
        });
      }

      const attachedTimesheet = await this.repo.save({
        description,
        company_id,
        attachment_id,
        created_by,
        timesheet_id,
        invoice_id,
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
      const attachment_id = args?.attachment_id;
      const status = args?.status;

      const found = await this.getById({ id });

      if (!found) {
        throw new NotFoundError({
          details: ['Attached Timesheet not found'],
        });
      }

      const update = merge(found, {
        id,
        description,
        attachment_id,
        status,
      });

      let attachedTimesheet = await this.repo.save(update);

      return attachedTimesheet;
    } catch (err) {
      throw err;
    }
  };
}
