import { injectable, inject } from 'inversify';
import { Resolver, Query, UseMiddleware, Arg, Ctx, Mutation } from 'type-graphql';
import { DeleteInput } from '../../entities/common.entity';
import { IJoiService, IErrorService } from '../../interfaces/common.interface';
import { IPaginationData } from '../../interfaces/paging.interface';
import { IUserRepository } from '../../interfaces/user.interface';
import { TYPES } from '../../types';
import Paging from '../../utils/paging';

import { Role as RoleEnum } from '../../config/constants';

import authenticate from '../middlewares/authenticate';
import authorize from '../middlewares/authorize';
import Currency, {
  CurrencyCreateInput,
  CurrencyPagingResult,
  CurrencyQueryInput,
  CurrencyUpdateInput,
} from '../../entities/currency.entity';
import CurrencyValidation from '../../validation/currency.validation';
import { ICurrencyRepository, ICurrencyService } from '../../interfaces/currency.interface';

@injectable()
@Resolver((of) => Currency)
export class CurrencyResolver {
  private name = 'CurrencyResolver';
  private currencyService: ICurrencyService;
  private joiService: IJoiService;
  private errorService: IErrorService;
  private currencyRepository: ICurrencyRepository;
  private userRepository: IUserRepository;

  constructor(
    @inject(TYPES.CurrencyService) currencyService: ICurrencyService,
    @inject(TYPES.JoiService) joiService: IJoiService,
    @inject(TYPES.ErrorService) errorService: IErrorService
  ) {
    this.currencyService = currencyService;
    this.joiService = joiService;
    this.errorService = errorService;
  }

  @Query((returns) => CurrencyPagingResult)
  @UseMiddleware(authenticate, authorize(RoleEnum.SuperAdmin, RoleEnum.CompanyAdmin))
  async Currency(
    @Arg('input', { nullable: true }) args: CurrencyQueryInput,
    @Ctx() ctx: any
  ): Promise<IPaginationData<Currency>> {
    const operation = 'Currencys';

    try {
      const pagingArgs = Paging.createPagingPayload(args);
      let result: IPaginationData<Currency> = await this.currencyService.getAllAndCount(pagingArgs);

      return result;
    } catch (err) {
      this.errorService.throwError({
        err,
        name: this.name,
        operation,
        logError: true,
      });
    }
  }

  @Mutation((returns) => Currency)
  @UseMiddleware(authenticate, authorize(RoleEnum.SuperAdmin))
  async CurrencyCreate(@Arg('input') args: CurrencyCreateInput, @Ctx() ctx: any): Promise<Currency> {
    const operation = 'CurrencyCreate';

    try {
      const name = args.name;
      const symbol = args.symbol;

      const schema = CurrencyValidation.create();
      await this.joiService.validate({
        schema,
        input: {
          name,
          symbol,
        },
      });

      let currency: Currency = await this.currencyService.create({
        name,
        symbol,
      });

      return currency;
    } catch (err) {
      this.errorService.throwError({
        err,
        name: this.name,
        operation,
        logError: true,
      });
    }
  }

  @Mutation((returns) => Currency)
  @UseMiddleware(authenticate, authorize(RoleEnum.SuperAdmin))
  async CurrencyUpdate(@Arg('input') args: CurrencyUpdateInput, @Ctx() ctx: any): Promise<Currency> {
    const operation = 'CurrencyUpdate';

    try {
      const id = args.id;
      const name = args.name;
      const symbol = args.symbol;

      const schema = CurrencyValidation.update();
      await this.joiService.validate({
        schema,
        input: {
          id,
          name,
          symbol,
        },
      });

      let currency: Currency = await this.currencyService.update({
        id,
        name,
        symbol,
      });

      return currency;
    } catch (err) {
      this.errorService.throwError({
        err,
        name: this.name,
        operation,
        logError: false,
      });
    }
  }

  @Mutation((returns) => Currency)
  @UseMiddleware(authenticate, authorize(RoleEnum.SuperAdmin))
  async CurrencyDelete(@Arg('input') args: DeleteInput, @Ctx() ctx: any): Promise<Currency> {
    const operation = 'CurrencyDelete';

    try {
      const id = args.id;

      let currency: Currency = await this.currencyService.remove({ id });

      return currency;
    } catch (err) {
      this.errorService.throwError({
        err,
        name: this.name,
        operation,
        logError: false,
      });
    }
  }
}
