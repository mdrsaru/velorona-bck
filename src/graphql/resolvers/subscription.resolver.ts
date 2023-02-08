import { inject, injectable } from 'inversify';
import { Resolver, Query, Ctx, Arg, Mutation, UseMiddleware, FieldResolver, Root } from 'type-graphql';

import { TYPES } from '../../types';
import { stripePrices, Role as RoleEnum } from '../../config/constants';
import authenticate from '../middlewares/authenticate';
import authorize from '../middlewares/authorize';
import { checkCompanyAccess } from '../middlewares/company';
import {
  SubscriptionCreateInput,
  SubscriptionCreateResult,
  SubscriptionUpgradeInput,
  SubscriptionUpgradeResult,
  SubscriptionCancelInput,
  SetupIntentSecretInput,
  SetupIntentResult,
  SubscriptionDowngradeInput,
  SubscriptionPaymentInput,
  CreatePaymentIntentInput,
  PaymentIntentResponse,
  RetrieveSubscriptionInput,
  Subscription,
} from '../../entities/subscription.entity';

import { IErrorService } from '../../interfaces/common.interface';
import { IGraphqlContext } from '../../interfaces/graphql.interface';
import { ISubscriptionService } from '../../interfaces/subscription.interface';
import StripeService from '../../services/stripe.service';
import { ICompanyRepository } from '../../interfaces/company.interface';

@injectable()
@Resolver()
export class SubscriptionResolver {
  private name = 'SubscriptionResolver';
  private errorService: IErrorService;
  private stripeService: StripeService;
  private companyRepository: ICompanyRepository;
  private subscriptionService: ISubscriptionService;

  constructor(
    @inject(TYPES.ErrorService) _errorService: IErrorService,
    @inject(TYPES.SubscriptionService) _subscriptionService: ISubscriptionService,
    @inject(TYPES.StripeService) _stripeService: StripeService,
    @inject(TYPES.CompanyRepository) _companyRepository: ICompanyRepository
  ) {
    this.errorService = _errorService;
    this.subscriptionService = _subscriptionService;
    this.stripeService = _stripeService;
    this.companyRepository = _companyRepository;
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

  @Mutation((returns) => String)
  @UseMiddleware(authenticate, authorize(RoleEnum.CompanyAdmin), checkCompanyAccess)
  async SubscriptionCancel(@Arg('input') args: SubscriptionCancelInput, @Ctx() ctx: any): Promise<string> {
    const operation = 'SubscriptionCancel';

    try {
      const company_id = args.company_id;

      const subscription = await this.subscriptionService.cancelSubscription({
        company_id,
      });

      return 'Your subscription will be cancelled at the end of the period.';
    } catch (err) {
      this.errorService.throwError({
        err,
        name: this.name,
        operation,
        logError: true,
      });
    }
  }

  @Query((returns) => SetupIntentResult)
  @UseMiddleware(authenticate, authorize(RoleEnum.CompanyAdmin), checkCompanyAccess)
  async SetupIntentSecret(@Arg('input') args: SetupIntentSecretInput): Promise<SetupIntentResult> {
    const operation = 'SetupIntentSecret';

    try {
      const company_id = args.company_id;

      const setupIntent: any = await this.stripeService.createPaymentIntent({
        company_id,
      });

      return {
        clientSecret: setupIntent.clientSecret,
      };
    } catch (err) {
      this.errorService.throwError({
        err,
        name: this.name,
        operation,
        logError: true,
      });
    }
  }

  @Query((returns) => Subscription)
  @UseMiddleware(authenticate, authorize(RoleEnum.CompanyAdmin), checkCompanyAccess)
  async RetrieveSubscription(@Arg('input') args: RetrieveSubscriptionInput): Promise<Subscription> {
    const operation = 'RetrieveSubscription';

    try {
      const company_id = args.company_id;

      const company = await this.companyRepository.getById({ id: company_id });
      const subscription: any = await this.stripeService.retrieveSubscription({
        subscription_id: company?.subscriptionId as string,
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

  @Mutation((returns) => String)
  @UseMiddleware(authenticate, authorize(RoleEnum.CompanyAdmin), checkCompanyAccess)
  async SubscriptionDowngrade(@Arg('input') args: SubscriptionDowngradeInput): Promise<String> {
    const operation = 'SubscriptionDowngrade';

    try {
      const company_id = args.company_id;

      await this.subscriptionService.downgradeSubscription({
        company_id,
        plan: 'Starter',
      });

      return 'Your subscription will be downgraded at the end of the period.';
    } catch (err) {
      this.errorService.throwError({
        err,
        name: this.name,
        operation,
        logError: true,
      });
    }
  }

  @Mutation((returns) => String)
  @UseMiddleware(authenticate)
  async SubscriptionPayment(@Arg('input') args: SubscriptionPaymentInput, @Ctx() ctx: any): Promise<String> {
    const operation = 'SubscriptionUpgrade';

    try {
      const customerId = args.customerId;
      const cardId = args.cardId;
      const company_id = args.company_id;
      const subscriptionPaymentId = args.subscriptionPaymentId;

      const subscription = await this.stripeService.subscriptionPayment({
        customerId,
        cardId,
        company_id,
        subscriptionPaymentId,
      });

      return 'Successful';
    } catch (err) {
      this.errorService.throwError({
        err,
        name: this.name,
        operation,
        logError: true,
      });
    }
  }

  @Mutation((returns) => PaymentIntentResponse)
  @UseMiddleware(authenticate)
  async CreatePaymentIntent(
    @Arg('input') args: CreatePaymentIntentInput,
    @Ctx() ctx: any
  ): Promise<PaymentIntentResponse> {
    const operation = 'SubscriptionUpgrade';

    try {
      const customerId = args.customerId;

      const subscription: any = await this.stripeService.createPaymentIntent({
        customerId,
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
