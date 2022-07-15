import { inject, injectable } from 'inversify';
import { Resolver, Query, Ctx, Arg, Mutation, UseMiddleware, FieldResolver, Root } from 'type-graphql';

import { TYPES } from '../../types';
import { Role as RoleEnum } from '../../config/constants';
import Paging from '../../utils/paging';
import authenticate from '../middlewares/authenticate';
import authorize from '../middlewares/authorize';
import { checkCompanyAccess } from '../middlewares/company';
import SubscriptionPayment, {
  SubscriptionPaymentPagingResult,
  SubscriptionPaymentQueryInput,
} from '../../entities/subscription-payment.entity';
import { PagingInput, MessageResponse } from '../../entities/common.entity';

import { IPaginationData } from '../../interfaces/paging.interface';
import { ISubscriptionPayment, ISubscriptionPaymentService } from '../../interfaces/subscription-payment.interface';
import { IErrorService, IJoiService } from '../../interfaces/common.interface';
import { IGraphqlContext } from '../../interfaces/graphql.interface';

@injectable()
@Resolver((of) => SubscriptionPayment)
export class SubscriptionPaymentResolver {
  private name = 'SubscriptionPaymentResolver';
  private subscriptionPaymentService: ISubscriptionPaymentService;
  private joiService: IJoiService;
  private errorService: IErrorService;

  constructor(
    @inject(TYPES.SubscriptionPaymentService) subscriptionPaymentService: ISubscriptionPaymentService,
    @inject(TYPES.ErrorService) errorService: IErrorService
  ) {
    this.subscriptionPaymentService = subscriptionPaymentService;
    this.errorService = errorService;
  }

  @Query((returns) => SubscriptionPaymentPagingResult)
  @UseMiddleware(authenticate, authorize(RoleEnum.CompanyAdmin), checkCompanyAccess)
  async SubscriptionPayment(
    @Arg('input') args: SubscriptionPaymentQueryInput,
    @Ctx() ctx: any
  ): Promise<IPaginationData<SubscriptionPayment>> {
    const operation = 'SubscriptionPayment';

    try {
      const pagingArgs = Paging.createPagingPayload(args);
      let result: IPaginationData<SubscriptionPayment> = await this.subscriptionPaymentService.getAllAndCount(
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
}
