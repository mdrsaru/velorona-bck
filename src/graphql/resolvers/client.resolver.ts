import { inject, injectable } from 'inversify';
import { Resolver, Query, Ctx, Arg, Mutation, UseMiddleware, FieldResolver, Root } from 'type-graphql';

import { TYPES } from '../../types';
import Paging from '../../utils/paging';
import User from '../../entities/user.entity';
import { Role as RoleEnum } from '../../config/constants';
import ClientValidation from '../../validation/client.validation';
import authenticate from '../middlewares/authenticate';
import authorize from '../middlewares/authorize';
import { checkCompanyAccess } from '../middlewares/company';
import Client, {
  ClientPagingResult,
  ClientQueryInput,
  ClientCreateInput,
  ClientUpdateInput,
  ClientDeleteInput,
  ClientCountInput,
} from '../../entities/client.entity';
import { PagingInput, MessageResponse } from '../../entities/common.entity';

import { IPaginationData } from '../../interfaces/paging.interface';
import { IClient, IClientService, IClientRepository } from '../../interfaces/client.interface';
import { IErrorService, IJoiService } from '../../interfaces/common.interface';
import { IGraphqlContext } from '../../interfaces/graphql.interface';

@injectable()
@Resolver((of) => Client)
export class ClientResolver {
  private name = 'ClientResolver';
  private clientService: IClientService;
  private joiService: IJoiService;
  private errorService: IErrorService;
  private clientRepository: IClientRepository;

  constructor(
    @inject(TYPES.ClientService) clientService: IClientService,
    @inject(TYPES.JoiService) joiService: IJoiService,
    @inject(TYPES.ErrorService) errorService: IErrorService,
    @inject(TYPES.ClientRepository) clientRepository: IClientRepository
  ) {
    this.clientService = clientService;
    this.joiService = joiService;
    this.errorService = errorService;
    this.clientRepository = clientRepository;
  }

  @Query((returns) => ClientPagingResult)
  @UseMiddleware(authenticate, checkCompanyAccess)
  async Client(@Arg('input') args: ClientQueryInput, @Ctx() ctx: any): Promise<IPaginationData<Client>> {
    const operation = 'Clients';

    try {
      const pagingArgs = Paging.createPagingPayload(args);
      let result: IPaginationData<Client> = await this.clientService.getAllAndCount(pagingArgs);

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
  @UseMiddleware(authenticate, checkCompanyAccess)
  async ClientCount(@Arg('input', { nullable: true }) args: ClientCountInput, @Ctx() ctx: any): Promise<Number> {
    const operation = 'User';
    try {
      let result: Number = await this.clientRepository.countEntities({ query: args });
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

  @Mutation((returns) => Client)
  @UseMiddleware(authenticate, authenticate, authorize(RoleEnum.SuperAdmin, RoleEnum.CompanyAdmin), checkCompanyAccess)
  async ClientCreate(@Arg('input') args: ClientCreateInput, @Ctx() ctx: any): Promise<Client> {
    const operation = 'ClientCreate';

    try {
      const name = args.name;
      const status = args.status;
      const email = args.email;
      const invoicingEmail = args.invoicingEmail;
      const address = args.address;
      const company_id = args.company_id;
      const archived = args.archived;
      const phone = args.phone;

      const schema = ClientValidation.create();
      await this.joiService.validate({
        schema,
        input: {
          name,
          email,
          invoicingEmail,
          company_id,
          status,
          archived,
          address,
          phone,
        },
      });

      let client: Client = await this.clientService.create({
        name,
        email,
        invoicingEmail,
        company_id,
        status,
        archived,
        address,
        phone,
      });

      return client;
    } catch (err) {
      this.errorService.throwError({
        err,
        name: this.name,
        operation,
        logError: true,
      });
    }
  }

  @Mutation((returns) => Client)
  @UseMiddleware(authenticate, authenticate, authorize(RoleEnum.SuperAdmin, RoleEnum.CompanyAdmin), checkCompanyAccess)
  async ClientUpdate(@Arg('input') args: ClientUpdateInput, @Ctx() ctx: any): Promise<Client> {
    const operation = 'ClientUpdate';

    try {
      const id = args.id;
      const name = args.name;
      const status = args.status;
      const address = args.address;
      const company_id = args.company_id;
      const archived = args.archived;
      const phone = args.phone;

      const schema = ClientValidation.update();
      await this.joiService.validate({
        schema,
        input: {
          id,
          name,
          company_id,
          status,
          archived,
          address,
          phone,
        },
      });

      let client: Client = await this.clientService.update({
        id,
        name,
        status,
        archived,
        address,
        phone,
      });

      return client;
    } catch (err) {
      this.errorService.throwError({
        err,
        name: this.name,
        operation,
        logError: false,
      });
    }
  }

  @Mutation((returns) => Client)
  @UseMiddleware(authenticate, authorize(RoleEnum.SuperAdmin, RoleEnum.CompanyAdmin), checkCompanyAccess)
  async ClientDelete(@Arg('input') args: ClientDeleteInput, @Ctx() ctx: any): Promise<Client> {
    const operation = 'ClientDelete';

    try {
      const id = args.id;

      let client: Client = await this.clientService.remove({ id });

      return client;
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
  company(@Root() root: Client, @Ctx() ctx: IGraphqlContext) {
    return ctx.loaders.companyByIdLoader.load(root.company_id);
  }

  @FieldResolver()
  address(@Root() root: User, @Ctx() ctx: IGraphqlContext) {
    return ctx.loaders.addressByIdLoader.load(root.address_id);
  }
}
