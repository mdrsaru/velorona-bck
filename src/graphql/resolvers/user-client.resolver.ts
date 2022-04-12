import { inject, injectable } from 'inversify';
import { Arg, Ctx, FieldResolver, Mutation, Resolver, Root, UseMiddleware } from 'type-graphql';
import UserClient, { AssociateUserClientInput } from '../../entities/user-client.entity';
import { IErrorService, IJoiService } from '../../interfaces/common.interface';
import { IGraphqlContext } from '../../interfaces/graphql.interface';
import { IUserClientService } from '../../interfaces/user-client.interface';
import { TYPES } from '../../types';
import UserClientValidation from '../../validation/user-client.validation';
import authenticate from '../middlewares/authenticate';

@injectable()
@Resolver((of) => UserClient)
export class UserClientResolver {
  private name = 'UserClientResolver';
  private userClientService: IUserClientService;
  private joiService: IJoiService;
  private errorService: IErrorService;

  constructor(
    @inject(TYPES.UserClientService) userClientService: IUserClientService,
    @inject(TYPES.JoiService) joiService: IJoiService,
    @inject(TYPES.ErrorService) errorService: IErrorService
  ) {
    this.userClientService = userClientService;
    this.joiService = joiService;
    this.errorService = errorService;
  }

  @Mutation((returns) => UserClient)
  @UseMiddleware(authenticate)
  async AssociateUserWithClient(@Arg('input') args: AssociateUserClientInput): Promise<UserClient> {
    const operation = 'AssociateUserClient';

    try {
      const user_id = args.user_id;
      const client_id = args.client_id;

      const schema = UserClientValidation.associate();
      await this.joiService.validate({
        schema,
        input: {
          client_id,
          user_id,
        },
      });

      const userClient: UserClient = await this.userClientService.associate({
        user_id,
        client_id,
      });
      return userClient;
    } catch (err) {
      throw err;
    }
  }

  @FieldResolver()
  async user(@Root() root: UserClient, @Ctx() ctx: IGraphqlContext) {
    return await ctx.loaders.usersByIdLoader.load(root.user_id);
  }

  @FieldResolver()
  async client(@Root() root: UserClient, @Ctx() ctx: IGraphqlContext) {
    return await ctx.loaders.usersByIdLoader.load(root.client_id);
  }
}
