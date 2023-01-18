import { inject, injectable } from 'inversify';
import { Brackets, getRepository, In, LessThanOrEqual, MoreThanOrEqual, Repository, SelectQueryBuilder } from 'typeorm';

import * as apiError from '../utils/api-error';
import { TYPES } from '../types';
import BaseRepository from './base.repository';
import SubscriptionPayment from '../entities/subscription-payment.entity';

import {
  ISubscriptionPaymentCreate,
  ISubscriptionPaymentRepository,
  ISubscriptionPaymentUpdate,
} from '../interfaces/subscription-payment.interface';
import { ICompanyRepository } from '../interfaces/company.interface';
import { IGetAllAndCountResult, IGetOptions } from '../interfaces/paging.interface';
import { isArray, merge } from 'lodash';

@injectable()
export default class SubscriptionPaymentRepository
  extends BaseRepository<SubscriptionPayment>
  implements ISubscriptionPaymentRepository
{
  private companyRepository: ICompanyRepository;

  constructor(@inject(TYPES.CompanyRepository) _companyRepository: ICompanyRepository) {
    super(getRepository(SubscriptionPayment));
    this.companyRepository = _companyRepository;
  }

  getAllAndCount = async (args: IGetOptions): Promise<IGetAllAndCountResult<SubscriptionPayment>> => {
    try {
      let { query = {}, select = [], relations = [], ...rest } = args;
      let { role: roleName, search, startDate, endDate, ...where } = query;
      const _select = select as (keyof SubscriptionPayment)[];

      for (let key in query) {
        if (isArray(query[key])) {
          query[key] = In(query[key]);
        }
      }
      if (search) {
        relations.push('company');
      }

      // Using function based where query since it needs inner join where clause
      const _where = (qb: SelectQueryBuilder<SubscriptionPayment>) => {
        const queryBuilder = qb.where(where);
        if (startDate && endDate) {
          queryBuilder.andWhere({
            paymentDate: MoreThanOrEqual(startDate),
          });
          queryBuilder.andWhere({
            paymentDate: LessThanOrEqual(endDate),
          });
        }
        if (search) {
          queryBuilder.andWhere(
            new Brackets((qb) => {
              qb.where('name ILike :search', { search: `%${search}%` ?? '' });
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

  create = async (args: ISubscriptionPaymentCreate): Promise<SubscriptionPayment> => {
    try {
      const status = args.status;
      const paymentDate = args.paymentDate;
      const amount = args.amount;
      const subscriptionId = args.subscriptionId;

      const company = await this.companyRepository.getSingleEntity({
        query: {
          subscriptionId,
        },
      });

      if (!company) {
        throw new apiError.NotFoundError({
          details: [`Company not found for subscription ${subscriptionId}`],
        });
      }

      const subscriptionPayment = this.repo.save({
        status,
        paymentDate,
        amount,
        company_id: company.id,
      });

      return subscriptionPayment;
    } catch (err) {
      throw err;
    }
  };

  update = async (args: ISubscriptionPaymentUpdate): Promise<SubscriptionPayment> => {
    try {
      const id = args.id;
      const invoiceLink = args.invoiceLink;
      const receiptLink = args.receiptLink;

      const found = await this.getById({ id });

      if (!found) {
        throw new apiError.NotFoundError({
          details: ['Subscription Payment not found'],
        });
      }

      const update = merge(found, {
        id,
        invoiceLink,
        receiptLink,
      });
      const subascriptionPayment = await this.repo.save(update);

      return subascriptionPayment;
    } catch (err) {
      throw err;
    }
  };
}
