import { inject, injectable } from 'inversify';
import { Resolver, Query, Ctx, Arg, Mutation, UseMiddleware } from 'type-graphql';

import { TYPES } from '../../types';
import Paging from '../../utils/paging';
import Client from '../../entities/client.entity';
import { IClient, IClientService } from '../../interfaces/client.interface';
import { IErrorService, IJoiService } from '../../interfaces/common.interface';
import ClientValidation from '../../validation/client.validation';
import {
  ClientPagingResult,
  ClientQueryInput,
  ClientCreateInput,
  ClientUpdateInput,
} from '../../entities/client.entity';
import { PagingInput, DeleteInput, MessageResponse } from '../../entities/common.entity';
import { IPaginationData } from '../../interfaces/paging.interface';

@injectable()
@Resolver()
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
  async Clients(
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
}
