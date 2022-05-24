import isNil from 'lodash/isNil';
import isEmpty from 'lodash/isEmpty';
import merge from 'lodash/merge';
import uniq from 'lodash/uniq';
import { injectable, inject } from 'inversify';
import { getRepository } from 'typeorm';

import { TYPES } from '../types';
import strings from '../config/strings';
import InvoiceItem from '../entities/invoice-item.entity';
import BaseRepository from './base.repository';
import * as apiError from '../utils/api-error';

import {
  IInvoiceItem,
  IInvoiceItemCreateInput,
  IInvoiceItemUpdateInput,
  IInvoiceItemRepository,
  IInvoiceItemRemoveMultipleInput,
} from '../interfaces/invoice-item.interface';
import { IProjectRepository } from '../interfaces/project.interface';

@injectable()
export default class InvoiceItemRepository extends BaseRepository<InvoiceItem> implements IInvoiceItemRepository {
  private projectRepository: IProjectRepository;

  constructor(@inject(TYPES.ProjectRepository) _projectRepository: IProjectRepository) {
    super(getRepository(InvoiceItem));
    this.projectRepository = _projectRepository;
  }

  createMultiple = async (args: IInvoiceItemCreateInput): Promise<InvoiceItem[]> => {
    try {
      const invoice_id = args.invoice_id;
      const items = args.items;

      const errors: string[] = [];

      const projectIds = items.map((item) => item.project_id);

      if (projectIds.filter((id) => isNil(id) || isEmpty(id))?.length) {
        errors.push(strings.oneOrMoreProjectRequired);
      }

      if (errors.length) {
        throw new apiError.ValidationError({
          details: errors,
        });
      }

      const foundProjectCount = await this.projectRepository.countEntities({
        query: {
          id: projectIds,
        },
      });

      if (foundProjectCount !== uniq(projectIds).length) {
        throw new apiError.NotFoundError({
          details: [strings.oneOrMoreProject404],
        });
      }

      const invoiceItems = items.map((item) => {
        return {
          invoice_id,
          project_id: item.project_id,
          hours: item.hours ?? 0,
          rate: item.rate ?? 0,
          amount: item.amount ?? 0,
        };
      });

      const entities = await this.repo.save(invoiceItems);

      return entities;
    } catch (err) {
      throw err;
    }
  };

  updateMultiple = async (items: IInvoiceItemUpdateInput[]): Promise<InvoiceItem[]> => {
    try {
      const ids = items.map((item) => item.id);

      const foundItems = await this.getAll({
        query: {
          id: ids,
        },
      });

      if (foundItems.length !== items.length) {
        throw new apiError.NotFoundError({
          details: [strings.oneOrMoreInvoiceItems404],
        });
      }

      const itemsMapById: { [id: string]: InvoiceItem } = {};

      foundItems.forEach((item) => {
        itemsMapById[item.id] = item;
      });

      const updates = items.map((item) => {
        const invoiceItem = itemsMapById[item.id];

        const update = merge(invoiceItem, item);

        return update;
      });

      const entities = await this.repo.save(updates);

      return entities;
    } catch (err) {
      throw err;
    }
  };

  removeMultiple = async (args: IInvoiceItemRemoveMultipleInput): Promise<true> => {
    try {
      const ids = args.ids;

      const entities = await this.repo.delete(ids);

      return true;
    } catch (err) {
      throw err;
    }
  };
}
