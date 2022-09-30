import { isString } from 'class-validator';
import { injectable } from 'inversify';
import { isNil, merge } from 'lodash';
import { getRepository } from 'typeorm';
import strings from '../config/strings';
import Currency from '../entities/currency.entity';
import { ICurrencyRepository, ICurrencyCreateInput, ICurrencyUpdateInput } from '../interfaces/currency.interface';
import BaseRepository from './base.repository';

import * as apiError from '../utils/api-error';

@injectable()
export default class CurrencyRepository extends BaseRepository<Currency> implements ICurrencyRepository {
  constructor() {
    super(getRepository(Currency));
  }

  create = async (args: ICurrencyCreateInput): Promise<Currency> => {
    try {
      const name = args.name;
      const symbol = args.symbol;

      const errors: string[] = [];

      if (isNil(name) || !isString(name)) {
        errors.push(strings.nameRequired);
      }
      if (isNil(symbol) || !isString(symbol)) {
        errors.push(strings.symbolRequired);
      }

      if (errors.length) {
        throw new apiError.ValidationError({
          details: errors,
        });
      }

      const currency = await this.repo.save({
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

      const errors: string[] = [];

      if (isNil(id) && !isString(id)) {
        errors.push(strings.idRequired);
      }

      if (errors.length) {
        throw new apiError.ValidationError({
          details: errors,
        });
      }

      const found = await this.getById({ id });

      if (!found) {
        throw new apiError.NotFoundError({
          details: [strings.currencyNotFound],
        });
      }

      const update: Currency = merge(found, {
        id,
        name,
        symbol,
      });

      const currency = await this.repo.save(update);

      return currency;
    } catch (err) {
      throw err;
    }
  };
}
