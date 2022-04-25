import { inject, injectable } from 'inversify';
import { Arg, Ctx, FieldResolver, Mutation, Resolver, Root, UseMiddleware } from 'type-graphql';

import { TYPES } from '../../types';
import { Role as RoleEnum } from '../../config/constants';
import authenticate from '../middlewares/authenticate';
import authorize from '../middlewares/authorize';
import { checkCompanyAccess } from '../middlewares/company';
import User from '../../entities/user.entity';
import UserClient, { UserClientAssociateInput, UserClientMakeInactiveInput } from '../../entities/user-client.entity';
import UserClientValidation from '../../validation/user-client.validation';

import { IErrorService, IJoiService } from '../../interfaces/common.interface';
import { IGraphqlContext } from '../../interfaces/graphql.interface';
import { IUserClientService } from '../../interfaces/user-client.interface';

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

  @Mutation((returns) => UserClient, { description: 'Associate user with client' })
  @UseMiddleware(authenticate, authorize(RoleEnum.SuperAdmin, RoleEnum.CompanyAdmin), checkCompanyAccess)
  async UserClientAssociate(@Arg('input') args: UserClientAssociateInput): Promise<UserClient> {
    const operation = 'UserClientAssociate';

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

  @Mutation((returns) => User, { description: 'Associate user with client' })
  @UseMiddleware(authenticate, authorize(RoleEnum.SuperAdmin, RoleEnum.CompanyAdmin), checkCompanyAccess)
  async UserClientMakeInactive(@Arg('input') args: UserClientMakeInactiveInput): Promise<User> {
    const operation = 'UserClientMakeInactive';

    try {
      const user_id = args.user_id;

      const schema = UserClientValidation.changeStatusToInactive();
      await this.joiService.validate({
        schema,
        input: {
          user_id,
        },
      });

      const user: User = await this.userClientService.changeStatusToInactive({
        user_id,
      });

      return user;
    } catch (err) {
      throw err;
    }
  }

  @FieldResolver()
  user(@Root() root: UserClient, @Ctx() ctx: IGraphqlContext) {
    return ctx.loaders.usersByIdLoader.load(root.user_id);
  }

  @FieldResolver()
  client(@Root() root: UserClient, @Ctx() ctx: IGraphqlContext) {
    return ctx.loaders.clientByIdLoader.load(root.client_id);
  }
}
