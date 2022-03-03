import { inject, injectable } from 'inversify';
import { Resolver, Query, Ctx, Arg, Mutation, UseMiddleware } from 'type-graphql';

import { IErrorService, IJoiService } from '../../interfaces/common.interface';
import ClientValidation from '../../validation/client.validation';
import Client from '../../entities/client.entity';
import { ClientPagingResult, ClientQueryInput, ClientCreate, ClientUpdate } from '../../entities/client.entity';
import { PagingInput, DeleteInput, MessageResponse } from '../../entities/common.entity';

import { TYPES } from '../../types';
import { IClient, IClientService } from '../../interfaces/client.interface';
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
  ): Promise<IPaginationData<IClient[]>> {
    const operation = 'Clients';

    try {
      let result: IPaginationData<IClient[]> = await this.clientService.getAllAndCount(args || {});
      return result;
    } catch (err) {
      this.errorService.throwError({ err, name: this.name, operation, logError: false });
    }
  }

  @Mutation((returns) => Client)
  async ClientCreate(@Arg('input') args: ClientCreate, @Ctx() ctx: any): Promise<IClient> {
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

      let client: IClient = await this.clientService.create({
        name,
        status,
      });

      return client;
    } catch (err) {
      this.errorService.throwError({ err, name: this.name, operation, logError: false });
    }
  }

  @Mutation((returns) => Client)
  async ClientUpdate(@Arg('input') args: ClientUpdate, @Ctx() ctx: any): Promise<IClient> {
    const operation = 'ClientUpdate';

    try {
      const name = args.name;
      const status = args.status;

      const schema = ClientValidation.update();
      await this.joiService.validate({
        schema,
        input: {
          name,
          status,
        },
      });

      let client: IClient = await this.clientService.update({
        name,
        status,
      });

      return client;
    } catch (err) {
      this.errorService.throwError({ err, name: this.name, operation, logError: false });
    }
  }

  @Mutation((returns) => Client)
  async ClientDelete(@Arg('input') args: DeleteInput, @Ctx() ctx: any): Promise<IClient> {
    const operation = 'ClientDelete';

    try {
      const id = args.id;

      let client: IClient = await this.clientService.remove({ id });

      return client;
    } catch (err) {
      this.errorService.throwError({ err, name: this.name, operation, logError: false });
    }
  }
}
