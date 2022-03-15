import { inject, injectable } from 'inversify';
import { Resolver, Query, Ctx, Arg, Mutation, UseMiddleware, FieldResolver, Root } from 'type-graphql';

import { TYPES } from '../../types';
import Paging from '../../utils/paging';
import User from '../../entities/user.entity';
import Client from '../../entities/client.entity';
import { Role as RoleEnum } from '../../config/constants';
import ClientValidation from '../../validation/client.validation';
import authenticate from '../middlewares/authenticate';
import authorize from '../middlewares/authorize';
import {
  ClientPagingResult,
  ClientQueryInput,
  ClientCreateInput,
  ClientUpdateInput,
} from '../../entities/client.entity';
import { PagingInput, DeleteInput, MessageResponse } from '../../entities/common.entity';

import { IPaginationData } from '../../interfaces/paging.interface';
import { IClient, IClientService } from '../../interfaces/client.interface';
import { IErrorService, IJoiService } from '../../interfaces/common.interface';
import { IGraphqlContext } from '../../interfaces/graphql.interface';

@injectable()
@Resolver((of) => Client)
export class ClientResolver {
  private name = 'ClientResolver';
  private clientService: IClientService;
  private joiService: IJoiService;
  private errorService: IErrorService;

  constructor(
    @inject(TYPES.ClientService) clientService: IClientService,
    @inject(TYPES.JoiService) joiService: IJoiService,
    @inject(TYPES.ErrorService) errorService: IErrorService
  ) {
    this.clientService = clientService;
    this.joiService = joiService;
    this.errorService = errorService;
  }

  @Query((returns) => ClientPagingResult)
  @UseMiddleware(authenticate)
  async Client(
    @Arg('input', { nullable: true }) args: ClientQueryInput,
    @Ctx() ctx: any
  ): Promise<IPaginationData<Client>> {
    const operation = 'Clients';

    try {
      const pagingArgs = Paging.createPagingPayload(args);
      let result: IPaginationData<Client> = await this.clientService.getAllAndCount(pagingArgs);
      return result;
    } catch (err) {
      this.errorService.throwError({ err, name: this.name, operation, logError: true });
    }
  }

  @Mutation((returns) => Client)
  @UseMiddleware(authenticate, authorize(RoleEnum.SuperAdmin))
  async ClientCreate(@Arg('input') args: ClientCreateInput, @Ctx() ctx: any): Promise<Client> {
    const operation = 'ClientCreate';

    try {
      const name = args.name;
      const status = args.status;

      const schema = ClientValidation.create();
      await this.joiService.validate({
        schema,
        input: {
          name,
          status,
        },
      });

      let client: Client = await this.clientService.create({
        name,
        status,
      });

      return client;
    } catch (err) {
      this.errorService.throwError({ err, name: this.name, operation, logError: true });
    }
  }

  @Mutation((returns) => Client)
  @UseMiddleware(authenticate, authorize(RoleEnum.SuperAdmin))
  async ClientUpdate(@Arg('input') args: ClientUpdateInput, @Ctx() ctx: any): Promise<Client> {
    const operation = 'ClientUpdate';

    try {
      const id = args.id;
      const name = args.name;
      const status = args.status;

      const schema = ClientValidation.update();
      await this.joiService.validate({
        schema,
        input: {
          id,
          name,
          status,
        },
      });

      let client: Client = await this.clientService.update({
        id,
        name,
        status,
      });

      return client;
    } catch (err) {
      this.errorService.throwError({ err, name: this.name, operation, logError: false });
    }
  }

  @Mutation((returns) => Client)
  @UseMiddleware(authenticate, authorize(RoleEnum.SuperAdmin))
  async ClientDelete(@Arg('input') args: DeleteInput, @Ctx() ctx: any): Promise<Client> {
    const operation = 'ClientDelete';

    try {
      const id = args.id;

      let client: Client = await this.clientService.remove({ id });

      return client;
    } catch (err) {
      this.errorService.throwError({ err, name: this.name, operation, logError: false });
    }
  }

  @FieldResolver()
  users(@Root() root: Client, @Ctx() ctx: IGraphqlContext) {
    return ctx.loaders.usersByClientIdLoader.load(root.id);
  }
}
