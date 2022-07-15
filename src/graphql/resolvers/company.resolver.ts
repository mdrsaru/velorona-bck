import { inject, injectable } from 'inversify';
import { Resolver, Query, Ctx, Arg, Mutation, UseMiddleware, FieldResolver, Root } from 'type-graphql';

import { TYPES } from '../../types';
import * as apiError from '../../utils/api-error';
import Paging from '../../utils/paging';
import User from '../../entities/user.entity';
import Company, { CompanyCountInput, CompanyGrowthOutput, CompanyByIdInput } from '../../entities/company.entity';
import { Role as RoleEnum } from '../../config/constants';
import CompanyValidation from '../../validation/company.validation';
import authenticate from '../middlewares/authenticate';
import authorize from '../middlewares/authorize';
import { checkCompanyAccess } from '../middlewares/company';
import {
  CompanyPagingResult,
  CompanyQueryInput,
  CompanyCreateInput,
  CompanyUpdateInput,
} from '../../entities/company.entity';
import { PagingInput, DeleteInput, MessageResponse } from '../../entities/common.entity';

import { IPaginationData } from '../../interfaces/paging.interface';
import { ICompanyRepository, ICompanyService } from '../../interfaces/company.interface';
import { IErrorService, IJoiService } from '../../interfaces/common.interface';
import { IGraphqlContext } from '../../interfaces/graphql.interface';
import { groupBy } from 'lodash';

@injectable()
@Resolver((of) => Company)
export class CompanyResolver {
  private name = 'CompanyResolver';
  private companyService: ICompanyService;
  private joiService: IJoiService;
  private errorService: IErrorService;
  private companyRepository: ICompanyRepository;

  constructor(
    @inject(TYPES.CompanyService) companyService: ICompanyService,
    @inject(TYPES.JoiService) joiService: IJoiService,
    @inject(TYPES.ErrorService) errorService: IErrorService,
    @inject(TYPES.CompanyRepository) _companyRepostitory: ICompanyRepository
  ) {
    this.companyService = companyService;
    this.joiService = joiService;
    this.errorService = errorService;
    this.companyRepository = _companyRepostitory;
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
  @UseMiddleware(authenticate, authorize(RoleEnum.SuperAdmin))
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

      const schema = CompanyValidation.create();
      await this.joiService.validate({
        schema,
        input: {
          name,
          status,
          archived,
          user,
          logo_id,
        },
      });

      let company: Company = await this.companyService.create({
        name,
        status,
        archived,
        user,
        logo_id,
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
  @UseMiddleware(authenticate, authorize(RoleEnum.SuperAdmin))
  async CompanyUpdate(@Arg('input') args: CompanyUpdateInput, @Ctx() ctx: any): Promise<Company> {
    const operation = 'CompanyUpdate';

    try {
      const id = args.id;
      const name = args.name;
      const status = args.status;
      const archived = args?.archived;
      const logo_id = args?.logo_id;

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
}
