import { inject, injectable } from 'inversify';
import { Resolver, Query, Ctx, Arg, Mutation, UseMiddleware, FieldResolver, Root } from 'type-graphql';

import { TYPES } from '../../types';
import { stripePrices } from '../../config/constants';
import {
  SubscriptionCreateInput,
  SubscriptionCreateResult,
  SubscriptionUpgradeInput,
  SubscriptionUpgradeResult,
} from '../../entities/subscription.entity';

import { IErrorService } from '../../interfaces/common.interface';
import { IGraphqlContext } from '../../interfaces/graphql.interface';
import { ISubscriptionService } from '../../interfaces/subscription.interface';
import authenticate from '../middlewares/authenticate';

@injectable()
@Resolver()
export class SubscriptionResolver {
  private name = 'SubscriptionResolver';
  private errorService: IErrorService;
  private subscriptionService: ISubscriptionService;

  constructor(
    @inject(TYPES.ErrorService) _errorService: IErrorService,
    @inject(TYPES.SubscriptionService) _subscriptionService: ISubscriptionService
  ) {
    this.errorService = _errorService;
    this.subscriptionService = _subscriptionService;
  }

  @Mutation((returns) => SubscriptionCreateResult)
  async SubscriptionCreate(
    @Arg('input') args: SubscriptionCreateInput,
    @Ctx() ctx: any
  ): Promise<SubscriptionCreateResult> {
    const operation = 'SubscriptionCreate';

    try {
      const company_id = args.company_id;

      const subscription = await this.subscriptionService.createSubscription({
        company_id,
        prices: [stripePrices.flatPrice, stripePrices.perUser],
      });

      return subscription;
    } catch (err) {
      this.errorService.throwError({
        err,
        name: this.name,
        operation,
        logError: true,
      });
    }
  }

  @Mutation((returns) => SubscriptionUpgradeResult)
  @UseMiddleware(authenticate)
  async SubscriptionUpgrade(
    @Arg('input') args: SubscriptionUpgradeInput,
    @Ctx() ctx: any
  ): Promise<SubscriptionUpgradeResult> {
    const operation = 'SubscriptionUpgrade';

    try {
      const company_id = args.company_id;
      const paymentId = args.paymentId;
      const userId = ctx.user.email;

      const subscription = await this.subscriptionService.upgradeSubscription({
        company_id,
        userId,
        paymentId,
      });

      return subscription;
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
