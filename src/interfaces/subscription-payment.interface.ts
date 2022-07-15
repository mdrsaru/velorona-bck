import SubscriptionPayment from '../entities/subscription-payment.entity';
import { IEntityID, IEntityRemove, ISingleEntityQuery } from './common.interface';
import { IGetAllAndCountResult, IPaginationData, IPagingArgs } from './paging.interface';
import { SubscriptionPaymentStatus } from '../config/constants';

export interface ISubscriptionPayment {
  id: string;
  status: SubscriptionPaymentStatus;
  paymentDate: Date;
  amount: number;
  company_id: string;
}

export interface ISubscriptionPaymentCreate {
  subscriptionId: string;
  status: ISubscriptionPayment['status'];
  paymentDate: ISubscriptionPayment['paymentDate'];
  amount: ISubscriptionPayment['amount'];
}

export interface ISubscriptionPaymentRepository {
  getAllAndCount(args: IPagingArgs): Promise<IGetAllAndCountResult<SubscriptionPayment>>;
  getAll(args: any): Promise<SubscriptionPayment[]>;
  getById(args: IEntityID): Promise<SubscriptionPayment | undefined>;
  getSingleEntity(args: ISingleEntityQuery): Promise<SubscriptionPayment | undefined>;
  create(args: ISubscriptionPaymentCreate): Promise<SubscriptionPayment>;
}

export interface ISubscriptionPaymentService {
  getAllAndCount(args: IPagingArgs): Promise<IPaginationData<SubscriptionPayment>>;
}
