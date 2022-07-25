import { inject, injectable } from 'inversify';
import { Resolver, Query, Ctx, Arg, Mutation, UseMiddleware, FieldResolver, Root } from 'type-graphql';

import { TYPES } from '../../types';
import Paging from '../../utils/paging';
import User from '../../entities/user.entity';
import { Role as RoleEnum } from '../../config/constants';
import authenticate from '../middlewares/authenticate';
import authorize from '../middlewares/authorize';
import { checkCompanyAccess } from '../middlewares/company';
import InvoicePaymentConfig, {
  InvoicePaymentConfigPagingResult,
  InvoicePaymentConfigQueryInput,
  InvoicePaymentConfigCreateInput,
  InvoicePaymentConfigUpdateInput,
} from '../../entities/invoice-payment-config.entity';
import { PagingInput, MessageResponse } from '../../entities/common.entity';

import { IPaginationData } from '../../interfaces/paging.interface';
import {
  IInvoicePaymentConfig,
  IInvoicePaymentConfigService,
  IInvoicePaymentConfigRepository,
} from '../../interfaces/invoice-payment-config.interface';
import { IErrorService, IJoiService } from '../../interfaces/common.interface';
import { IGraphqlContext } from '../../interfaces/graphql.interface';

@injectable()
@Resolver((of) => InvoicePaymentConfig)
export class InvoicePaymentConfigResolver {
  private name = 'InvoicePaymentConfigResolver';
  private invoicePaymentConfigService: IInvoicePaymentConfigService;
  private errorService: IErrorService;
  private invoicePaymentConfigRepository: IInvoicePaymentConfigRepository;

  constructor(
    @inject(TYPES.InvoicePaymentConfigService) invoicePaymentConfigService: IInvoicePaymentConfigService,
    @inject(TYPES.ErrorService) errorService: IErrorService,
    @inject(TYPES.InvoicePaymentConfigRepository) invoicePaymentConfigRepository: IInvoicePaymentConfigRepository
  ) {
    this.invoicePaymentConfigService = invoicePaymentConfigService;
    this.errorService = errorService;
    this.invoicePaymentConfigRepository = invoicePaymentConfigRepository;
  }

  @Query((returns) => InvoicePaymentConfigPagingResult)
  @UseMiddleware(authenticate)
  async InvoicePaymentConfig(
    @Arg('input', { nullable: true }) args: InvoicePaymentConfigQueryInput,
    @Ctx() ctx: any
  ): Promise<IPaginationData<InvoicePaymentConfig>> {
    const operation = 'InvoicePaymentConfig';

    try {
      const pagingArgs = Paging.createPagingPayload(args);
      let result: IPaginationData<InvoicePaymentConfig> = await this.invoicePaymentConfigService.getAllAndCount(
        pagingArgs
      );

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

  @Mutation((returns) => InvoicePaymentConfig)
  @UseMiddleware(authenticate, authorize(RoleEnum.SuperAdmin))
  async InvoicePaymentConfigCreate(
    @Arg('input') args: InvoicePaymentConfigCreateInput,
    @Ctx() ctx: any
  ): Promise<InvoicePaymentConfig> {
    const operation = 'InvoicePaymentConfigCreate';

    try {
      const name = args.name;
      const days = args.days;

      let invoicePaymentConfig: InvoicePaymentConfig = await this.invoicePaymentConfigRepository.create({
        name,
        days,
      });

      return invoicePaymentConfig;
    } catch (err) {
      this.errorService.throwError({
        err,
        name: this.name,
        operation,
        logError: true,
      });
    }
  }

  @Mutation((returns) => InvoicePaymentConfig)
  @UseMiddleware(authenticate, authorize(RoleEnum.SuperAdmin), checkCompanyAccess)
  async InvoicePaymentConfigUpdate(
    @Arg('input') args: InvoicePaymentConfigUpdateInput,
    @Ctx() ctx: any
  ): Promise<InvoicePaymentConfig> {
    const operation = 'InvoicePaymentConfigUpdate';

    try {
      const id = args.id;
      const name = args.name;
      const days = args.days;

      let invoicePaymentConfig: InvoicePaymentConfig = await this.invoicePaymentConfigRepository.update({
        id,
        name,
        days,
      });

      return invoicePaymentConfig;
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
