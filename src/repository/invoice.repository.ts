import merge from 'lodash/merge';
import isNil from 'lodash/isNil';
import isDate from 'lodash/isDate';
import isString from 'lodash/isString';
import isEmpty from 'lodash/isEmpty';
import difference from 'lodash/difference';
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
import {
  IInvoiceItemRepository,
  IInvoiceItemInput,
  IInvoiceItemUpdateInput,
} from '../interfaces/invoice-item.interface';
import { ITimeEntryRepository } from '../interfaces/time-entry.interface';

@injectable()
export default class InvoiceRepository extends BaseRepository<Invoice> implements IInvoiceRepository {
  private clientRepository: IClientRepository;
  private companyRepository: ICompanyRepository;
  private invoiceItemRepository: IInvoiceItemRepository;
  private timeEntryRepository: ITimeEntryRepository;

  constructor(
    @inject(TYPES.ClientRepository) _clientRepository: IClientRepository,
    @inject(TYPES.CompanyRepository) _companyRepository: ICompanyRepository,
    @inject(TYPES.InvoiceItemRepository) _invoiceItemRepository: IInvoiceItemRepository,
    @inject(TYPES.TimeEntryRepository) _timeEntryRepository: ITimeEntryRepository
  ) {
    super(getRepository(Invoice));
    this.clientRepository = _clientRepository;
    this.companyRepository = _companyRepository;
    this.invoiceItemRepository = _invoiceItemRepository;
    this.timeEntryRepository = _timeEntryRepository;
  }

  create = async (args: IInvoiceCreateInput): Promise<Invoice> => {
    try {
      const timesheet_id = args.timesheet_id;
      const status = args.status;
      const issueDate = args.issueDate;
      const dueDate = args.dueDate;
      const poNumber = args.poNumber;
      const totalQuantity = args.totalQuantity;
      const subtotal = args.subtotal;
      const totalAmount = args.totalAmount;
      const taxPercent = args.taxPercent ?? 0;
      const notes = args.notes;
      const company_id = args.company_id;
      const client_id = args.client_id;
      const items = args.items;

      const errors: string[] = [];

      if (isNil(issueDate) || !isDate(issueDate)) {
        errors.push(strings.dateRequired);
      }
      if (isNil(dueDate) || !isDate(dueDate)) {
        errors.push(strings.dueDateRequired);
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

      if (dueDate < issueDate) {
        throw new apiError.ValidationError({
          details: [strings.dueDateMustBeValid],
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
        issueDate,
        dueDate,
        poNumber,
        totalQuantity,
        subtotal,
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

      if (timesheet_id) {
        await this.timeEntryRepository.markApprovedTimeEntriesWithInvoice({
          timesheet_id,
          invoice_id: invoice.id,
        });
      }

      return invoice;
    } catch (err) {
      throw err;
    }
  };

  update = async (args: IInvoiceUpdateInput): Promise<Invoice> => {
    try {
      const id = args.id;
      const status = args.status;
      const issueDate = args.issueDate;
      const dueDate = args.dueDate;
      const poNumber = args.poNumber;
      const totalQuantity = args.totalQuantity;
      const subtotal = args.subtotal;
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
        issueDate,
        dueDate,
        poNumber,
        totalQuantity,
        subtotal,
        totalAmount,
        taxPercent,
        notes,
      });

      // TODO: Use transaction
      if (items && items.length) {
        const itemsToCreate: IInvoiceItemInput[] = [];
        const itemsToUpdate: IInvoiceItemUpdateInput[] = [];
        const itemIds: string[] = [];

        items.forEach((item) => {
          if (item.id) {
            itemIds.push(item.id);
            itemsToUpdate.push(item);
          } else {
            itemsToCreate.push(item);
          }
        });

        const allItems = await this.invoiceItemRepository.getAll({
          query: {
            invoice_id: found.id,
          },
        });

        const allItemIds = allItems.map((item) => item.id);
        const itemsToDelete = difference(allItemIds, itemIds);

        if (itemsToDelete.length) {
          await this.invoiceItemRepository.removeMultiple({
            ids: itemsToDelete,
          });
        }

        if (itemsToCreate.length) {
          await this.invoiceItemRepository.createMultiple({
            invoice_id: found.id,
            items: itemsToCreate,
          });
        }

        if (itemsToUpdate.length) {
          await this.invoiceItemRepository.updateMultiple(itemsToUpdate);
        }
      }

      const invoice = await this.repo.save(update);

      return invoice;
    } catch (err) {
      throw err;
    }
  };
}
