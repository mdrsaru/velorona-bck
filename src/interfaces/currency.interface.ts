import { IPagingArgs, IGetAllAndCountResult, IPaginationData, IGetOptions } from './paging.interface';
import { IEntityID, IEntityRemove, ISingleEntityQuery } from './common.interface';
import { IAddressInput } from './address.interface';
import DemoRequest from '../entities/demo-request.entity';
import { DemoRequestStatus } from '../config/constants';
import Currency from '../entities/currency.entity';

export interface ICurrency {
  id: string;
  name: string;
  symbol: string;
}

export interface ICurrencyCreateInput {
  name: ICurrency['name'];
  symbol: ICurrency['symbol'];
}

export interface ICurrencyUpdateInput {
  id: string;
  name?: ICurrency['name'];
  symbol?: ICurrency['symbol'];
}

export interface ICurrencyRepository {
  getAllAndCount(args: IPagingArgs): Promise<IGetAllAndCountResult<Currency>>;
  getAll(args: any): Promise<Currency[]>;
  getSingleEntity(args: ISingleEntityQuery): Promise<Currency | undefined>;
  getById(args: IEntityID): Promise<Currency | undefined>;
  create(args: ICurrencyCreateInput): Promise<Currency>;
  update(args: ICurrencyUpdateInput): Promise<Currency>;
  remove(args: IEntityRemove): Promise<Currency>;
}

export interface ICurrencyService {
  getAllAndCount(args: IPagingArgs): Promise<IPaginationData<Currency>>;
  create(args: ICurrencyCreateInput): Promise<Currency>;
  update(args: ICurrencyUpdateInput): Promise<Currency>;
  remove(args: IEntityRemove): Promise<Currency>;
}
