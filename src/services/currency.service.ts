import { injectable, inject } from 'inversify';
import Currency from '../entities/currency.entity';
import { IEntityRemove } from '../interfaces/common.interface';
import {
  ICurrencyCreateInput,
  ICurrencyRepository,
  ICurrencyService,
  ICurrencyUpdateInput,
} from '../interfaces/currency.interface';
import { IPagingArgs, IPaginationData } from '../interfaces/paging.interface';
import { TYPES } from '../types';
import Paging from '../utils/paging';

@injectable()
export default class CurrencyService implements ICurrencyService {
  private currencyRepository: ICurrencyRepository;

  constructor(@inject(TYPES.CurrencyRepository) currencyRepository: ICurrencyRepository) {
    this.currencyRepository = currencyRepository;
  }

  getAllAndCount = async (args: IPagingArgs): Promise<IPaginationData<Currency>> => {
    try {
      const { rows, count } = await this.currencyRepository.getAllAndCount(args);

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

  create = async (args: ICurrencyCreateInput): Promise<Currency> => {
    try {
      const name = args.name;
      const symbol = args.symbol;

      const currency = await this.currencyRepository.create({
        name,
        symbol,
      });

      return currency;
    } catch (err) {
      throw err;
    }
  };

  update = async (args: ICurrencyUpdateInput): Promise<Currency> => {
    try {
      const id = args.id;
      const name = args.name;
      const symbol = args.symbol;

      const currency = await this.currencyRepository.update({
        id,
        name,
        symbol,
      });

      return currency;
    } catch (err) {
      throw err;
    }
  };

  remove = async (args: IEntityRemove): Promise<Currency> => {
    try {
      const id = args.id;

      const currency = await this.currencyRepository.remove({
        id,
      });

      return currency;
    } catch (err) {
      throw err;
    }
  };
}
