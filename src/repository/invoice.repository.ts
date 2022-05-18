import merge from 'lodash/merge';
import isNil from 'lodash/isNil';
import isDate from 'lodash/isDate';
import isString from 'lodash/isString';
import isEmpty from 'lodash/isEmpty';
import { injectable, inject } from 'inversify';
import { getRepository, Repository } from 'typeorm';
import crypto from 'crypto';

import { TYPES } from '../types';
import strings from '../config/strings';
import Invoice from '../entities/invoice.entity';
import BaseRepository from './base.repository';
import * as apiError from '../utils/api-error';

import {
  IInvoice,
  IInvoiceCreateInput,
  IInvoiceUpdateInput,
  IInvoiceRepository,
} from '../interfaces/invoice.interface';
import { IClientRepository } from '../interfaces/client.interface';
import { ICompanyRepository } from '../interfaces/company.interface';
import { IInvoiceItemRepository } from '../interfaces/invoice-item.interface';

@injectable()
export default class InvoiceRepository extends BaseRepository<Invoice> implements IInvoiceRepository {
  private clientRepository: IClientRepository;
  private companyRepository: ICompanyRepository;
  private invoiceItemRepository: IInvoiceItemRepository;

  constructor(
    @inject(TYPES.ClientRepository) _clientRepository: IClientRepository,
    @inject(TYPES.CompanyRepository) _companyRepository: ICompanyRepository,
    @inject(TYPES.InvoiceItemRepository) _invoiceItemRepository: IInvoiceItemRepository
  ) {
    super(getRepository(Invoice));
    this.clientRepository = _clientRepository;
    this.companyRepository = _companyRepository;
    this.invoiceItemRepository = _invoiceItemRepository;
  }

  create = async (args: IInvoiceCreateInput): Promise<Invoice> => {
    try {
      const status = args.status;
      const date = args.date;
      const paymentDue = args.paymentDue;
      const poNumber = args.poNumber;
      const totalAmount = args.totalAmount;
      const taxPercent = args.taxPercent ?? 0;
      const notes = args.notes;
      const company_id = args.company_id;
      const client_id = args.client_id;
      const items = args.items;

      const errors: string[] = [];

      if (isNil(date) || !isDate(date)) {
        errors.push(strings.dateRequired);
      }
      if (isNil(paymentDue) || !isDate(paymentDue)) {
        errors.push(strings.paymentDueRequired);
      }
      if (isNil(poNumber) || isEmpty(poNumber)) {
        errors.push(strings.poNumberRequired);
      }
      if (isNil(totalAmount) || isEmpty(poNumber)) {
        errors.push(strings.poNumberRequired);
      }
      if (isNil(company_id) || isEmpty(company_id)) {
        errors.push(strings.companyRequired);
      }
      if (isNil(client_id) || isEmpty(client_id)) {
        errors.push(strings.clientRequired);
      }

      if (errors.length) {
        throw new apiError.ValidationError({
          details: errors,
        });
      }

      if (paymentDue < date) {
        throw new apiError.ValidationError({
          details: [strings.paymentDueMustBeValid],
        });
      }

      if (!(await this.clientRepository.getById({ id: client_id }))) {
        throw new apiError.NotFoundError({
          details: [strings.clientNotFound],
        });
      }

      if (!(await this.companyRepository.getById({ id: company_id }))) {
        throw new apiError.NotFoundError({
          details: [strings.companyNotFound],
        });
      }

      // TODO: Add transaction for rollback
      const invoice = await this.repo.save({
        status,
        date,
        paymentDue,
        poNumber,
        totalAmount,
        taxPercent,
        notes,
        company_id,
        client_id,
      });

      await this.invoiceItemRepository.createMultiple({
        invoice_id: invoice.id,
        items,
      });

      return invoice;
    } catch (err) {
      throw err;
    }
  };

  update = async (args: IInvoiceUpdateInput): Promise<Invoice> => {
    try {
      const id = args.id;
      const status = args.status;
      const date = args.date;
      const paymentDue = args.paymentDue;
      const poNumber = args.poNumber;
      const totalAmount = args.totalAmount;
      const taxPercent = args.taxPercent ?? 0;
      const notes = args.notes;
      const items = args.items;

      const found = await this.getById({ id });

      if (!found) {
        throw new apiError.NotFoundError({
          details: [strings.invoiceNotFound],
        });
      }

      const update = merge(found, {
        id,
        status,
        date,
        paymentDue,
        poNumber,
        totalAmount,
        taxPercent,
        notes,
      });

      if (items && items.length) {
        await this.invoiceItemRepository.updateMultiple(items);
      }

      const invoice = await this.repo.save(update);

      return invoice;
    } catch (err) {
      throw err;
    }
  };
}
