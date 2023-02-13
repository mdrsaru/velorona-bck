import SubscriptionPayment from '../entities/subscription-payment.entity';
import { IEntityID, IEntityRemove, ISingleEntityQuery } from './common.interface';
import { IGetAllAndCountResult, IPaginationData, IPagingArgs } from './paging.interface';
import { SubscriptionPaymentStatus } from '../config/constants';

export interface ISubscriptionPayment {
  id: string;
  status: SubscriptionPaymentStatus;
  paymentDate: Date;
  periodStartDate: string;
  periodEndDate: string;
  amount: number;
  company_id: string;
  invoiceLink?: string;
  receiptLink?: string;
  invoiceId?: string;
}

export interface ISubscriptionPaymentCreate {
  subscriptionId: string;
  receiptLink?: ISubscriptionPayment['receiptLink'];
  invoiceLink?: ISubscriptionPayment['invoiceLink'];
  status: ISubscriptionPayment['status'];
  paymentDate?: ISubscriptionPayment['paymentDate'];
  amount: ISubscriptionPayment['amount'];
  periodStartDate?: ISubscriptionPayment['periodStartDate'];
  periodEndDate?: ISubscriptionPayment['periodEndDate'];
  invoiceId?: ISubscriptionPayment['invoiceId'];
}

export interface ISubscriptionPaymentUpdate {
  id: string;
  subscriptionId?: string;
  status?: string;
  paymentDate?: ISubscriptionPayment['paymentDate'];
  periodStartDate?: ISubscriptionPayment['periodStartDate'];
  periodEndDate?: ISubscriptionPayment['periodEndDate'];
  amount?: ISubscriptionPayment['amount'];
  invoiceLink?: ISubscriptionPayment['invoiceLink'];
  receiptLink?: ISubscriptionPayment['receiptLink'];
}

export interface ISubscriptionPaymentRepository {
  getAllAndCount(args: IPagingArgs): Promise<IGetAllAndCountResult<SubscriptionPayment>>;
  getAll(args: any): Promise<SubscriptionPayment[]>;
  getById(args: IEntityID): Promise<SubscriptionPayment | undefined>;
  getSingleEntity(args: ISingleEntityQuery): Promise<SubscriptionPayment | undefined>;
  create(args: ISubscriptionPaymentCreate): Promise<SubscriptionPayment>;
  update(args: ISubscriptionPaymentUpdate): Promise<SubscriptionPayment>;
}

export interface ISubscriptionPaymentService {
  getAllAndCount(args: IPagingArgs): Promise<IPaginationData<SubscriptionPayment>>;
}
