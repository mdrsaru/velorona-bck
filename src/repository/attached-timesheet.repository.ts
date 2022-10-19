import { inject, injectable } from 'inversify';
import { merge } from 'lodash';
import { getRepository } from 'typeorm';
import axios from 'axios';

import strings from '../config/strings';
import { entities, AttachmentType } from '../config/constants';
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
  IUpdateWithInvoiceInput,
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
      const type = args.type;
      const amount = args.amount;
      const date = args.date;

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
      if (timesheet_id) {
        const timesheet = await this.timesheetRepository.getById({
          id: timesheet_id,
          select: ['id', 'isSubmitted'],
        });

        if (!timesheet) {
          throw new NotFoundError({
            details: [strings.timesheetNotFound],
          });
        }

        if (timesheet.isSubmitted) {
          throw new ValidationError({
            details: [strings.cannotAddAttachment],
          });
        }
      }
      const attachedTimesheet = await this.repo.save({
        description,
        company_id,
        attachment_id,
        created_by,
        timesheet_id,
        invoice_id,
        type,
        amount,
        date,
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
      const type = args.type;
      const amount = args.amount;
      const date = args.date;

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
        type,
        amount,
        date,
      });

      let attachedTimesheet = await this.repo.save(update);

      return attachedTimesheet;
    } catch (err) {
      throw err;
    }
  };

  getBase64Attachments = async (args: any): Promise<any> => {
    try {
      const timesheet_id = args.timesheet_id;
      const invoice_id = args.invoice_id;

      const attachments = await this.getAll({
        query: {
          invoice_id,
        },
        relations: ['attachments'],
      });

      const promises = attachments.map((attachment, index) => {
        return axios.get(attachment.attachments.url, { responseType: 'arraybuffer' }).then((response) => {
          return {
            name: attachment?.attachments?.name ?? `attachment-${index}.jpg`,
            response,
          };
        });
      });

      const result = await Promise.allSettled(promises);

      const fulfilledAttachments: any = [];

      result.forEach((res) => {
        if (res.status === 'fulfilled') {
          fulfilledAttachments.push(res.value);
        }
      });

      return fulfilledAttachments.map((fulfilled: any) => {
        let buffer = Buffer.from(fulfilled.response.data).toString('base64');
        const contentType = fulfilled.response.headers['content-type'];

        return {
          name: fulfilled.name,
          contentType,
          base64: buffer,
        };
      });
    } catch (err) {
      throw err;
    }
  };

  updateTimesheetAttachmentWithInvoice = async (args: IUpdateWithInvoiceInput): Promise<any> => {
    try {
      const result = await this.repo
        .createQueryBuilder(entities.timesheetAttachments)
        .update(AttachedTimesheet)
        .set({
          invoice_id: args.invoice_id,
        })
        .where('timesheet_id = :timesheet_id', { timesheet_id: args.timesheet_id })
        .andWhere('invoice_id IS NULL')
        .execute();

      return result;
    } catch (err) {
      throw err;
    }
  };

  totalAmountByInvoice = async (invoice_id: string): Promise<number> => {
    try {
      const result = await this.repo
        .createQueryBuilder(entities.timesheetAttachments)
        .select('SUM(amount)', 'totalAmount')
        .where('attachment_type = :attachmentType', { attachmentType: AttachmentType.Expense })
        .andWhere('invoice_id = :invoice_id', { invoice_id })
        .execute();

      return result;
    } catch (err) {
      throw err;
    }
  };
}
