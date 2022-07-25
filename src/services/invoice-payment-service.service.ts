import { injectable, inject } from 'inversify';

import {
  IInvoicePaymentConfigRepository,
  IInvoicePaymentConfigService,
} from '../interfaces/invoice-payment-config.interface';
import InvoicePaymentConfig from '../entities/invoice-payment-config.entity';
import Paging from '../utils/paging';
import { TYPES } from '../types';
import { IPagingArgs, IPaginationData } from '../interfaces/paging.interface';
import { IEntityRemove, IEntityID } from '../interfaces/common.interface';
@injectable()
export default class InvoicePaymentConfigService implements IInvoicePaymentConfigService {
  private invoicePaymentConfigRepository: IInvoicePaymentConfigRepository;

  constructor(
    @inject(TYPES.InvoicePaymentConfigRepository) invoicePaymentConfigRepository: IInvoicePaymentConfigRepository
  ) {
    this.invoicePaymentConfigRepository = invoicePaymentConfigRepository;
  }

  getAllAndCount = async (args: IPagingArgs): Promise<IPaginationData<InvoicePaymentConfig>> => {
    try {
      const { rows, count } = await this.invoicePaymentConfigRepository.getAllAndCount(args);

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
