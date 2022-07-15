import { inject, injectable } from 'inversify';
import SubscriptionPayment from '../entities/subscription-payment.entity';
import { IEntityID, IEntityRemove, IErrorService, ILogger } from '../interfaces/common.interface';
import { IPaginationData, IPagingArgs } from '../interfaces/paging.interface';
import {
  ISubscriptionPaymentCreate,
  ISubscriptionPaymentRepository,
  ISubscriptionPaymentService,
} from '../interfaces/subscription-payment.interface';
import { TYPES } from '../types';
import Paging from '../utils/paging';

@injectable()
export default class SubscriptionPaymentService implements ISubscriptionPaymentService {
  private name = 'SubscriptionPaymentService';
  private subscriptionPaymentRepository: ISubscriptionPaymentRepository;

  constructor(
    @inject(TYPES.SubscriptionPaymentRepository) subscriptionPaymentRepository: ISubscriptionPaymentRepository
  ) {
    this.subscriptionPaymentRepository = subscriptionPaymentRepository;
  }

  getAllAndCount = async (args: IPagingArgs): Promise<IPaginationData<SubscriptionPayment>> => {
    try {
      const { rows, count } = await this.subscriptionPaymentRepository.getAllAndCount(args);

      const paging = Paging.getPagingResult({
        ...args,
        total: count,
      });

      return {
        paging,
        data: rows,
      };
    } catch (err) {
      throw err;
    }
  };
}
