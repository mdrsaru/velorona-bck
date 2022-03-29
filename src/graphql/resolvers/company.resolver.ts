import { inject, injectable } from 'inversify';
import { Resolver, Query, Ctx, Arg, Mutation, UseMiddleware, FieldResolver, Root } from 'type-graphql';

import { TYPES } from '../../types';
import Paging from '../../utils/paging';
import User from '../../entities/user.entity';
import Company from '../../entities/company.entity';
import { Role as RoleEnum } from '../../config/constants';
import CompanyValidation from '../../validation/company.validation';
import authenticate from '../middlewares/authenticate';
import authorize from '../middlewares/authorize';
import {
  CompanyPagingResult,
  CompanyQueryInput,
  CompanyCreateInput,
  CompanyUpdateInput,
} from '../../entities/company.entity';
import { PagingInput, DeleteInput, MessageResponse } from '../../entities/common.entity';

import { IPaginationData } from '../../interfaces/paging.interface';
import { ICompany, ICompanyService } from '../../interfaces/company.interface';
import { IErrorService, IJoiService } from '../../interfaces/common.interface';
import { IGraphqlContext } from '../../interfaces/graphql.interface';

@injectable()
@Resolver((of) => Company)
export class CompanyResolver {
  private name = 'CompanyResolver';
  private companyService: ICompanyService;
  private joiService: IJoiService;
  private errorService: IErrorService;

  constructor(
    @inject(TYPES.CompanyService) companyService: ICompanyService,
    @inject(TYPES.JoiService) joiService: IJoiService,
    @inject(TYPES.ErrorService) errorService: IErrorService
  ) {
    this.companyService = companyService;
    this.joiService = joiService;
    this.errorService = errorService;
  }

  @Query((returns) => CompanyPagingResult)
  @UseMiddleware(authenticate)
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

  @Mutation((returns) => Company)
  @UseMiddleware(authenticate, authorize(RoleEnum.SuperAdmin))
  async CompanyCreate(@Arg('input') args: CompanyCreateInput, @Ctx() ctx: any): Promise<Company> {
    const operation = 'CompanyCreate';

    try {
      const name = args.name;
      const status = args.status;
      const isArchived = args?.isArchived;

      const schema = CompanyValidation.create();
      await this.joiService.validate({
        schema,
        input: {
          name,
          status,
          isArchived,
        },
      });

      let company: Company = await this.companyService.create({
        name,
        status,
        isArchived,
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
      const isArchived = args?.isArchived;

      const schema = CompanyValidation.update();
      await this.joiService.validate({
        schema,
        input: {
          id,
          name,
          status,
          isArchived,
        },
      });

      let company: Company = await this.companyService.update({
        id,
        name,
        status,
        isArchived,
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
}
