import { inject, injectable } from 'inversify';
import { Resolver, Query, Ctx, Arg, Mutation, UseMiddleware } from 'type-graphql';

import { TYPES } from '../../types';
import Paging from '../../utils/paging';
import { Role as RoleEnum } from '../../config/constants';
import DemoRequestValidation from '../../validation/demo-request.validation';
import authenticate from '../middlewares/authenticate';
import authorize from '../middlewares/authorize';
import { checkCompanyAccess } from '../middlewares/company';
import DemoRequest, {
  DemoRequestPagingResult,
  DemoRequestQueryInput,
  DemoRequestCreateInput,
  DemoRequestUpdateInput,
} from '../../entities/demo-request.entity';
import { PagingInput, DeleteInput } from '../../entities/common.entity';

import { IPaginationData } from '../../interfaces/paging.interface';
import { IDemoRequest, IDemoRequestService, IDemoRequestRepository } from '../../interfaces/demo-request.interface';
import { IErrorService, IJoiService } from '../../interfaces/common.interface';
import { IGraphqlContext } from '../../interfaces/graphql.interface';

@injectable()
@Resolver((of) => DemoRequest)
export class DemoRequestResolver {
  private name = 'DemoRequestResolver';
  private demoRequestService: IDemoRequestService;
  private joiService: IJoiService;
  private errorService: IErrorService;

  constructor(
    @inject(TYPES.DemoRequestService) demoRequestService: IDemoRequestService,
    @inject(TYPES.JoiService) joiService: IJoiService,
    @inject(TYPES.ErrorService) errorService: IErrorService
  ) {
    this.demoRequestService = demoRequestService;
    this.joiService = joiService;
    this.errorService = errorService;
  }

  @Query((returns) => DemoRequestPagingResult)
  @UseMiddleware(authenticate, checkCompanyAccess)
  async DemoRequest(
    @Arg('input', { nullable: true }) args: DemoRequestQueryInput,
    @Ctx() ctx: any
  ): Promise<IPaginationData<DemoRequest>> {
    const operation = 'DemoRequests';

    try {
      const pagingArgs = Paging.createPagingPayload(args);
      let result: IPaginationData<DemoRequest> = await this.demoRequestService.getAllAndCount(pagingArgs);

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

  @Mutation((returns) => DemoRequest)
  async DemoRequestCreate(@Arg('input') args: DemoRequestCreateInput, @Ctx() ctx: any): Promise<DemoRequest> {
    const operation = 'DemoRequestCreate';

    try {
      const fullName = args.fullName;
      const email = args.email;
      const phone = args.phone;
      const jobTitle = args.jobTitle;
      const companyName = args.companyName;

      const schema = DemoRequestValidation.create();
      await this.joiService.validate({
        schema,
        input: {
          fullName,
          email,
          phone,
          jobTitle,
          companyName,
        },
      });

      let demoRequest: DemoRequest = await this.demoRequestService.create({
        fullName,
        email,
        phone,
        jobTitle,
        companyName,
      });

      return demoRequest;
    } catch (err) {
      this.errorService.throwError({
        err,
        name: this.name,
        operation,
        logError: true,
      });
    }
  }

  @Mutation((returns) => DemoRequest)
  @UseMiddleware(authenticate, authorize(RoleEnum.SuperAdmin, RoleEnum.CompanyAdmin), checkCompanyAccess)
  async DemoRequestUpdate(@Arg('input') args: DemoRequestUpdateInput, @Ctx() ctx: any): Promise<DemoRequest> {
    const operation = 'DemoRequestUpdate';

    try {
      const id = args.id;
      const status = args.status;

      const schema = DemoRequestValidation.update();
      await this.joiService.validate({
        schema,
        input: {
          id,
          status,
        },
      });

      let demoRequest: DemoRequest = await this.demoRequestService.update({
        id,
        status,
      });

      return demoRequest;
    } catch (err) {
      this.errorService.throwError({
        err,
        name: this.name,
        operation,
        logError: false,
      });
    }
  }

  @Mutation((returns) => DemoRequest)
  @UseMiddleware(authenticate, authorize(RoleEnum.SuperAdmin, RoleEnum.CompanyAdmin), checkCompanyAccess)
  async DemoRequestDelete(@Arg('input') args: DeleteInput, @Ctx() ctx: any): Promise<DemoRequest> {
    const operation = 'DemoRequestDelete';

    try {
      const id = args.id;

      let demoRequest: DemoRequest = await this.demoRequestService.remove({ id });

      return demoRequest;
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
