import merge from 'lodash/merge';
import isNil from 'lodash/isNil';
import isString from 'lodash/isString';
import isArray from 'lodash/isArray';
import { injectable, inject } from 'inversify';
import { getRepository, Repository, In, ILike, FindConditions } from 'typeorm';

import { TYPES } from '../types';
import strings from '../config/strings';
import InvoicePaymentConfig from '../entities/invoice-payment-config.entity';
import BaseRepository from './base.repository';
import * as apiError from '../utils/api-error';

import { ICompanyRepository } from '../interfaces/company.interface';
import { IGetAllAndCountResult, IGetOptions } from '../interfaces/paging.interface';
import {
  IInvoicePaymentConfig,
  IInvoicePaymentConfigCreateInput,
  IInvoicePaymentConfigUpdateInput,
  IInvoicePaymentConfigRepository,
} from '../interfaces/invoice-payment-config.interface';

@injectable()
export default class InvoicePaymentConfigRepository
  extends BaseRepository<InvoicePaymentConfig>
  implements IInvoicePaymentConfigRepository
{
  constructor(@inject(TYPES.CompanyRepository) _companyRepository: ICompanyRepository) {
    super(getRepository(InvoicePaymentConfig));
  }

  create = async (args: IInvoicePaymentConfigCreateInput): Promise<InvoicePaymentConfig> => {
    try {
      const name = args.name?.trim();
      const days = args.days;

      const errors: string[] = [];

      if (isNil(name) || !isString(name)) {
        errors.push(strings.nameRequired);
      }
      if (isNil(days)) {
        errors.push(strings.daysRequired);
      }

      if (errors.length) {
        throw new apiError.ValidationError({
          details: errors,
        });
      }

      const invoicePaymentConfig = await this.repo.save({
        name,
        days,
      });

      return invoicePaymentConfig;
    } catch (err) {
      throw err;
    }
  };

  update = async (args: IInvoicePaymentConfigUpdateInput): Promise<InvoicePaymentConfig> => {
    try {
      const id = args.id;
      const name = args.name?.trim();
      const days = args.days;

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
          details: ['Payment not found'],
        });
      }

      const update: InvoicePaymentConfig = merge(found, {
        id,
        name,
        days,
      });

      const invoicePaymentConfig = await this.repo.save(update);

      return invoicePaymentConfig;
    } catch (err) {
      throw err;
    }
  };
}
