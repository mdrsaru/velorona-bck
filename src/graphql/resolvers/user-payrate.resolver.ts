import { inject, injectable } from 'inversify';
import { Arg, Ctx, FieldResolver, Mutation, Query, Resolver, Root, UseMiddleware } from 'type-graphql';
import UserPayRate, {
  UserPayRateCreateInput,
  UserPayRatePagingResult,
  UserPayRateQueryInput,
  UserPayRateUpdateInput,
} from '../../entities/user-payrate.entity';
import { IErrorService, IJoiService } from '../../interfaces/common.interface';
import { IPaginationData } from '../../interfaces/paging.interface';
import { IUserPayRate, IUserPayRateService } from '../../interfaces/user-payrate.interface';
import { TYPES } from '../../types';
import { Role as RoleEnum } from '../../config/constants';
import Paging from '../../utils/paging';
import authenticate from '../middlewares/authenticate';
import authorize from '../middlewares/authorize';
import { checkCompanyAccess } from '../middlewares/company';
import UserPayRateValidation from '../../validation/user-payrate.validation';
import { DeleteInput } from '../../entities/common.entity';
import { IGraphqlContext } from '../../interfaces/graphql.interface';

@injectable()
@Resolver((of) => UserPayRate)
export class UserPayRateResolver {
  private name = 'UserPayRateResolver';
  private userPayRateService: IUserPayRateService;
  private errorService: IErrorService;
  private joiService: IJoiService;

  constructor(
    @inject(TYPES.UserPayRateService) userPayRateService: IUserPayRateService,
    @inject(TYPES.ErrorService) errorService: IErrorService,
    @inject(TYPES.JoiService) _joiService: IJoiService
  ) {
    this.userPayRateService = userPayRateService;
    this.errorService = errorService;
    this.joiService = _joiService;
  }

  @Query((returns) => UserPayRatePagingResult)
  @UseMiddleware(
    authenticate,
    authorize(RoleEnum.CompanyAdmin, RoleEnum.TaskManager, RoleEnum.SuperAdmin, RoleEnum.Employee)
  )
  async UserPayRate(
    @Arg('input', { nullable: true }) args: UserPayRateQueryInput,
    @Ctx() ctx: any
  ): Promise<IPaginationData<UserPayRate>> {
    const operation = 'UserPayrate';

    try {
      const pagingArgs = Paging.createPagingPayload(args);
      let result: IPaginationData<UserPayRate> = await this.userPayRateService.getAllAndCount(pagingArgs);

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

  @Mutation((returns) => UserPayRate)
  @UseMiddleware(
    authenticate,
    authorize(RoleEnum.CompanyAdmin, RoleEnum.TaskManager, RoleEnum.SuperAdmin),
    checkCompanyAccess
  )
  async UserPayRateCreate(@Arg('input') args: UserPayRateCreateInput, @Ctx() ctx: any): Promise<UserPayRate> {
    const operation = 'UserPayRateCreate';
    try {
      const startDate = args.startDate;
      const endDate = args.endDate;
      const amount = args.amount;
      const user_id = args.user_id;
      const project_id = args.project_id;
      const invoiceRate = args.invoiceRate;

      const schema = UserPayRateValidation.create();
      await this.joiService.validate({
        schema,
        input: {
          startDate,
          endDate,
          amount,
          user_id,
          project_id,
        },
      });
      let userPayRate: UserPayRate = await this.userPayRateService.create({
        startDate,
        endDate,
        amount,
        user_id,
        project_id,
        invoiceRate,
      });
      return userPayRate;
    } catch (err) {
      this.errorService.throwError({
        err,
        name: this.name,
        operation,
        logError: false,
      });
    }
  }

  @Mutation((returns) => UserPayRate)
  @UseMiddleware(authenticate)
  async UserPayRateUpdate(@Arg('input') args: UserPayRateUpdateInput, @Ctx() ctx: any): Promise<UserPayRate> {
    const operation = 'UserPayRateUpdate';

    try {
      const id = args.id;
      const startDate = args.startDate;
      const endDate = args.endDate;
      const amount = args.amount;
      const user_id = args.user_id;
      const project_id = args.project_id;
      const invoiceRate = args.invoiceRate;

      const schema = UserPayRateValidation.update();
      await this.joiService.validate({
        schema,
        input: {
          id,
          startDate,
          endDate,
          amount,
          user_id,
          project_id,
        },
      });

      let userPayRate: UserPayRate = await this.userPayRateService.update({
        id,
        startDate,
        endDate,
        amount,
        user_id,
        project_id,
        invoiceRate,
      });

      return userPayRate;
    } catch (err) {
      this.errorService.throwError({
        err,
        name: this.name,
        operation,
        logError: false,
      });
    }
  }

  @Mutation((returns) => UserPayRate)
  @UseMiddleware(authenticate)
  async UserPayRateDelete(@Arg('input') args: DeleteInput, @Ctx() ctx: any): Promise<UserPayRate> {
    const operation = 'UserPayRateDelete';

    try {
      const id = args.id;
      let userPayRate: UserPayRate = await this.userPayRateService.remove({ id });

      return userPayRate;
    } catch (err) {
      this.errorService.throwError({
        err,
        name: this.name,
        operation,
        logError: false,
      });
    }
  }

  @FieldResolver()
  async user(@Root() root: UserPayRate, @Ctx() ctx: IGraphqlContext) {
    return await ctx.loaders.usersByIdLoader.load(root.user_id);
  }

  @FieldResolver()
  project(@Root() root: UserPayRate, @Ctx() ctx: IGraphqlContext) {
    return ctx.loaders.projectByIdLoader.load(root.project_id);
  }
}
