import Dataloader from 'dataloader';
import { ICurrencyRepository } from '../../interfaces/currency.interface';
import container from '../../inversify.config';
import { TYPES } from '../../types';

const batchCurrencyByIdFn = async (ids: readonly string[]) => {
  const currencyRepo: ICurrencyRepository = container.get(TYPES.CurrencyRepository);
  const query = { id: ids };
  const currency = await currencyRepo.getAll({ query });
  const currencyObj: any = {};

  currency.forEach((currency: any) => {
    currencyObj[currency.id] = currency;
  });
  return ids.map((id) => currencyObj[id]);
};

export const currencyByIdLoader = () => new Dataloader(batchCurrencyByIdFn);
