import merge from 'lodash/merge';
import isNil from 'lodash/isNil';
import isDate from 'lodash/isDate';
import isString from 'lodash/isString';
import isEmpty from 'lodash/isEmpty';
import difference from 'lodash/difference';
import { injectable, inject } from 'inversify';
import { Brackets, getRepository, In, SelectQueryBuilder } from 'typeorm';
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
import { ITimesheetRepository } from '../interfaces/timesheet.interface';
import { IGetAllAndCountResult, IGetOptions } from '../interfaces/paging.interface';
import { isArray } from 'lodash';

@injectable()
export default class InvoiceRepository extends BaseRepository<Invoice> implements IInvoiceRepository {
  private clientRepository: IClientRepository;
  private companyRepository: ICompanyRepository;
  private invoiceItemRepository: IInvoiceItemRepository;
  private timeEntryRepository: ITimeEntryRepository;
  private timesheetRepository: ITimesheetRepository;

  constructor(
    @inject(TYPES.ClientRepository) _clientRepository: IClientRepository,
    @inject(TYPES.CompanyRepository) _companyRepository: ICompanyRepository,
    @inject(TYPES.InvoiceItemRepository) _invoiceItemRepository: IInvoiceItemRepository,
    @inject(TYPES.TimeEntryRepository) _timeEntryRepository: ITimeEntryRepository,
    @inject(TYPES.TimesheetRepository) _timesheetRepository: ITimesheetRepository
  ) {
    super(getRepository(Invoice));
    this.clientRepository = _clientRepository;
    this.companyRepository = _companyRepository;
    this.invoiceItemRepository = _invoiceItemRepository;
    this.timeEntryRepository = _timeEntryRepository;
    this.timesheetRepository = _timesheetRepository;
  }

  getAllAndCount = async (args: IGetOptions): Promise<IGetAllAndCountResult<Invoice>> => {
    try {
      let { query = {}, select = [], relations = [], ...rest } = args;
      let { role: roleName, search, ...where } = query;
      const _select = select as (keyof Invoice)[];

      for (let key in query) {
        if (isArray(query[key])) {
          query[key] = In(query[key]);
        }
      }

      if (search) {
        relations.push('client');
      }

      // Using function based where query since it needs inner join where clause
      const _where = (qb: SelectQueryBuilder<Invoice>) => {
        const queryBuilder = qb.where(where);
        if (search) {
          queryBuilder.andWhere(
            new Brackets((qb) => {
              qb.where('name ILike :search', { search: `%${search}%` ?? '' }).orWhere(
                '"invoicingEmail" ILike :search',
                {
                  search: `%${search}%` ?? '',
                }
              );
            })
          );
        }
      };

      let [rows, count] = await this.repo.findAndCount({
        relations,
        where: _where,
        ...(_select?.length && { select: _select }),
        ...rest,
      });

      return {
        count,
        rows,
      };
    } catch (err) {
      throw err;
    }
  };

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
      const taxAmount = args.taxAmount ?? 0;
      const notes = args.notes;
      const company_id = args.company_id;
      const client_id = args.client_id;
      const discount = args.discount ?? 0;
      const shipping = args.shipping ?? 0;
      const needProject = args.needProject;
      const items = args.items;

      const errors: string[] = [];

      if (isNil(issueDate) || !isDate(issueDate)) {
        errors.push(strings.dateRequired);
      }
      if (isNil(dueDate) || !isDate(dueDate)) {
        errors.push(strings.dueDateRequired);
      }
      if (isNil(totalAmount)) {
        errors.push(strings.totalAmountRequired);
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
        taxAmount,
        notes,
        company_id,
        client_id,
        timesheet_id,
        discount,
        shipping,
        needProject,
      });

      await this.invoiceItemRepository.createMultiple({
        invoice_id: invoice.id,
        items,
      });

      /**
       * As invoice is generated for particular timesheet, need to mark all the time entries with the invoice_id
       */
      if (timesheet_id) {
        await this.timeEntryRepository.markApprovedTimeEntriesWithInvoice({
          timesheet_id,
          invoice_id: invoice.id,
        });

        const timesheet = await this.timesheetRepository.getById({
          id: timesheet_id,
          select: ['weekStartDate', 'weekEndDate', 'user_id'],
        });

        // Update timesheet total expense and total invoiced hours
        if (timesheet) {
          const startTime = timesheet.weekStartDate + ' 00:00:00';
          const endTime = timesheet.weekEndDate + ' 00:00:00';

          const totalExpense = await this.timeEntryRepository.getUserTotalExpense({
            company_id,
            user_id: timesheet.user_id,
            client_id,
            startTime,
            endTime,
            timesheet_id,
            invoiced: true,
          });

          const invoicedDuration = await this.timeEntryRepository.getTotalTimeInSeconds({
            company_id,
            user_id: timesheet.user_id,
            startTime,
            endTime,
            invoiced: true,
            timesheet_id,
          });

          await this.timesheetRepository.update({
            id: timesheet_id,
            totalExpense,
            invoicedDuration,
          });
        }
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
      const taxAmount = args.taxAmount ?? 0;
      const notes = args.notes;
      const discount = args.discount;
      const shipping = args.shipping;
      const needProject = args.needProject;
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
        taxAmount,
        notes,
        discount,
        shipping,
        needProject,
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
