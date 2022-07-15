import { inject, injectable } from 'inversify';
import { getRepository, Repository } from 'typeorm';

import * as apiError from '../utils/api-error';
import { TYPES } from '../types';
import BaseRepository from './base.repository';
import SubscriptionPayment from '../entities/subscription-payment.entity';

import {
  ISubscriptionPaymentCreate,
  ISubscriptionPaymentRepository,
} from '../interfaces/subscription-payment.interface';
import { ICompanyRepository } from '../interfaces/company.interface';

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
}
