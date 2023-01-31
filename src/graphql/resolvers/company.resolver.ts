import { groupBy } from 'lodash';
import { inject, injectable } from 'inversify';
import { Resolver, Query, Ctx, Arg, Mutation, UseMiddleware, FieldResolver, Root } from 'type-graphql';

import { TYPES } from '../../types';
import * as apiError from '../../utils/api-error';
import Paging from '../../utils/paging';
import User from '../../entities/user.entity';
import Company, {
  CompanyCountInput,
  CompanyGrowthOutput,
  CompanyByIdInput,
  Customer,
} from '../../entities/company.entity';
import { Role as RoleEnum, CompanyStatus } from '../../config/constants';
import CompanyValidation from '../../validation/company.validation';
import authenticate from '../middlewares/authenticate';
import authorize from '../middlewares/authorize';
import { checkCompanyAccess } from '../middlewares/company';
import {
  CompanyPagingResult,
  CompanyQueryInput,
  CompanyCreateInput,
  CompanyUpdateInput,
  CompanySignUpInput,
  CompanyResendInvitationInput,
} from '../../entities/company.entity';
import { PagingInput, DeleteInput, MessageResponse } from '../../entities/common.entity';

import { IPaginationData } from '../../interfaces/paging.interface';
import { ICompanyRepository, ICompanyService } from '../../interfaces/company.interface';
import { IErrorService, IJoiService } from '../../interfaces/common.interface';
import { IGraphqlContext } from '../../interfaces/graphql.interface';
import { IUserRepository } from '../../interfaces/user.interface';
import { IAuthService } from '../../interfaces/auth.interface';
import StripeService from '../../services/stripe.service';

@injectable()
@Resolver((of) => Company)
export class CompanyResolver {
  private name = 'CompanyResolver';
  private companyService: ICompanyService;
  private joiService: IJoiService;
  private errorService: IErrorService;
  private companyRepository: ICompanyRepository;
  private userRepository: IUserRepository;
  private stripeService: StripeService;
  private authService: IAuthService;

  constructor(
    @inject(TYPES.CompanyService) companyService: ICompanyService,
    @inject(TYPES.JoiService) joiService: IJoiService,
    @inject(TYPES.ErrorService) errorService: IErrorService,
    @inject(TYPES.CompanyRepository) _companyRepostitory: ICompanyRepository,
    @inject(TYPES.UserRepository) _userRepostitory: IUserRepository,
    @inject(TYPES.StripeService) _stripeService: StripeService,
    @inject(TYPES.AuthService) _authService: IAuthService
  ) {
    this.companyService = companyService;
    this.joiService = joiService;
    this.errorService = errorService;
    this.companyRepository = _companyRepostitory;
    this.userRepository = _userRepostitory;
    this.authService = _authService;
    this.stripeService = _stripeService;
  }

  @Query((returns) => Company)
  @UseMiddleware(authenticate, authorize(RoleEnum.SuperAdmin, RoleEnum.CompanyAdmin), checkCompanyAccess)
  async CompanyById(@Arg('input') args: CompanyByIdInput, @Ctx() ctx: IGraphqlContext): Promise<Company> {
    const operation = 'CompanyById';

    try {
      let company = await this.companyRepository.getById({
        id: args.id,
      });

      if (!company) {
        throw new apiError.NotFoundError({
          details: ['Company not found'],
        });
      }

      return company;
    } catch (err) {
      this.errorService.throwError({
        err,
        name: this.name,
        operation,
        logError: true,
      });
    }
  }

  @Query((returns) => CompanyPagingResult)
  @UseMiddleware(authenticate, authorize(RoleEnum.SuperAdmin, RoleEnum.CompanyAdmin))
  async Company(
    @Arg('input', { nullable: true }) args: CompanyQueryInput,
    @Ctx() ctx: any
  ): Promise<IPaginationData<Company>> {
    const operation = 'Companys';

    try {
      const pagingArgs = Paging.createPagingPayload(args);
      let result: IPaginationData<Company> = await this.companyService.getAllAndCount(pagingArgs);

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

  @Query((returns) => Number)
  @UseMiddleware(authenticate, authorize(RoleEnum.SuperAdmin))
  async CompanyCount(@Arg('input', { nullable: true }) args: CompanyCountInput, @Ctx() ctx: any): Promise<Number> {
    const operation = 'Project Count';
    try {
      let result: Number = await this.companyRepository.countEntities({ query: args });
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

  @Query((returns) => [CompanyGrowthOutput])
  @UseMiddleware(authenticate, authorize(RoleEnum.SuperAdmin))
  async CompanyGrowth(
    @Arg('input', { nullable: true }) args: CompanyCountInput,
    @Ctx() ctx: any
  ): Promise<CompanyGrowthOutput[]> {
    const operation = 'Project Count';
    try {
      let result: CompanyGrowthOutput[] = await this.companyRepository.companyGrowth({ query: args });
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

  @Query((returns) => [Customer])
  @UseMiddleware(authenticate, authorize(RoleEnum.SuperAdmin, RoleEnum.CompanyAdmin))
  async RetrieveCustomer(
    @Arg('input', { nullable: true }) args: CompanyByIdInput,
    @Ctx() ctx: any
  ): Promise<Customer[]> {
    const operation = 'Customer Retrieve';
    try {
      const companyId = args?.id;
      let company: any = await this.companyRepository.getById({ id: companyId });

      const customer = await this.stripeService.retrieveCustomer({
        customerId: company?.stripeCustomerId,
      });
      return customer;
    } catch (err) {
      this.errorService.throwError({
        err,
        name: this.name,
        operation,
        logError: true,
      });
    }
  }

  @Mutation((returns) => Company)
  @UseMiddleware(authenticate, authorize(RoleEnum.SuperAdmin))
  async CompanyCreate(@Arg('input') args: CompanyCreateInput, @Ctx() ctx: any): Promise<Company> {
    const operation = 'CompanyCreate';

    try {
      const name = args.name;
      const status = args.status;
      const archived = args?.archived;
      const user = args.user;
      const logo_id = args?.logo_id;
      const plan = args?.plan;

      const schema = CompanyValidation.create();
      await this.joiService.validate({
        schema,
        input: {
          name,
          status,
          archived,
          user,
          logo_id,
          plan,
        },
      });

      let company: Company = await this.companyService.create({
        name,
        status,
        archived,
        user,
        logo_id,
        plan,
      });

      return company;
    } catch (err) {
      this.errorService.throwError({
        err,
        name: this.name,
        operation,
        logError: true,
      });
    }
  }

  @Mutation((returns) => Company)
  async CompanySignUp(@Arg('input') args: CompanySignUpInput, @Ctx() ctx: any): Promise<Company> {
    const operation = 'CompanySignUp';

    try {
      const name = args.name;
      const user = args.user;
      const status = CompanyStatus.Unapproved;
      const logo_id = args?.logo_id;
      const plan = args?.plan;

      const schema = CompanyValidation.signUp();
      await this.joiService.validate({
        schema,
        input: {
          name,
          user,
          logo_id,
        },
      });

      let company: Company = await this.companyService.create({
        name,
        status,
        logo_id,
        user,
        plan,
      });

      return company;
    } catch (err) {
      this.errorService.throwError({
        err,
        name: this.name,
        operation,
        logError: true,
      });
    }
  }

  @Mutation((returns) => Company)
  @UseMiddleware(authenticate, authorize(RoleEnum.SuperAdmin, RoleEnum.CompanyAdmin))
  async CompanyUpdate(@Arg('input') args: CompanyUpdateInput, @Ctx() ctx: any): Promise<Company> {
    const operation = 'CompanyUpdate';

    try {
      const id = args.id;
      const name = args.name;
      const status = args.status;
      const archived = args?.archived;
      const logo_id = args?.logo_id;
      const user = args?.user;
      const collectionMethod = args?.collectionMethod;

      const schema = CompanyValidation.update();
      await this.joiService.validate({
        schema,
        input: {
          id,
          name,
          status,
          archived,
        },
      });

      let company: Company = await this.companyService.update({
        id,
        name,
        status,
        archived,
        logo_id,
        user,
        collectionMethod,
      });

      return company;
    } catch (err) {
      this.errorService.throwError({
        err,
        name: this.name,
        operation,
        logError: false,
      });
    }
  }

  @Mutation((returns) => Company)
  @UseMiddleware(authenticate, authorize(RoleEnum.SuperAdmin))
  async CompanyDelete(@Arg('input') args: DeleteInput, @Ctx() ctx: any): Promise<Company> {
    const operation = 'CompanyDelete';

    try {
      const id = args.id;

      let company: Company = await this.companyService.remove({ id });

      return company;
    } catch (err) {
      this.errorService.throwError({
        err,
        name: this.name,
        operation,
        logError: false,
      });
    }
  }

  @Mutation((returns) => String)
  @UseMiddleware(authenticate, authorize(RoleEnum.SuperAdmin))
  async CompanyResendInvitation(@Arg('input') args: CompanyResendInvitationInput, @Ctx() ctx: any): Promise<String> {
    const operation = 'CompanyResendInvitation';

    try {
      const id = args.id;

      const company = await this.companyRepository.getById({
        id,
        select: ['adminEmail'],
      });

      if (!company) {
        throw new apiError.NotFoundError({
          details: ['Company not found'],
        });
      }

      const user = await this.userRepository.getSingleEntity({
        query: {
          email: company.adminEmail,
          company_id: id,
        },
      });

      if (!user) {
        throw new apiError.NotFoundError({
          details: ['User not found'],
        });
      }

      await this.authService.resendInvitation({
        company_id: id,
        user_id: user.id,
      });

      return 'Email has been re-sent.';
    } catch (err) {
      this.errorService.throwError({
        err,
        name: this.name,
        operation,
        logError: true,
      });
    }
  }

  @FieldResolver()
  users(@Root() root: Company, @Ctx() ctx: IGraphqlContext) {
    return ctx.loaders.usersByCompanyIdLoader.load(root.id);
  }

  @FieldResolver()
  logo(@Root() root: Company, @Ctx() ctx: IGraphqlContext) {
    if (root.logo_id) {
      return ctx.loaders.avatarByIdLoader.load(root.logo_id);
    }
    return null;
  }

  @FieldResolver()
  admin(@Root() root: Company, @Ctx() ctx: IGraphqlContext) {
    return this.userRepository.getSingleEntity({
      query: {
        email: root.adminEmail,
        company_id: root.id,
      },
    });
  }
}
