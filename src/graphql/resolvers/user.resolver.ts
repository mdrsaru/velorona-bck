import { inject, injectable } from 'inversify';
import {
  Resolver,
  Query,
  Ctx,
  Arg,
  Mutation,
  UseMiddleware,
  FieldResolver,
  Root,
} from 'type-graphql';

import { TYPES } from '../../types';
import { Role as RoleEnum } from '../../config/constants';
import Client from '../../entities/client.entity';
import Paging from '../../utils/paging';
import authenticate from '../middlewares/authenticate';
import { canCreateSystemAdmin } from '../middlewares/user';
import authorize from '../middlewares/authorize';
import UserValidation from '../../validation/user.validation';
import {
  PagingInput,
  DeleteInput,
  MessageResponse,
} from '../../entities/common.entity';
import User, {
  UserPagingResult,
  UserCreateInput,
  UserUpdateInput,
  UserQueryInput,
  ChangeProfilePictureInput,
} from '../../entities/user.entity';

import { IPaginationData } from '../../interfaces/paging.interface';
import { IUserService } from '../../interfaces/user.interface';
import { IGraphqlContext } from '../../interfaces/graphql.interface';
import { IErrorService, IJoiService } from '../../interfaces/common.interface';
import Media from '../../entities/media.entity';

@injectable()
@Resolver((of) => User)
export class UserResolver {
  private name = 'UserResolver';
  private userService: IUserService;
  private joiService: IJoiService;
  private errorService: IErrorService;
  private clientLoader: any;
  private loader: any;

  constructor(
    @inject(TYPES.UserService) _userService: IUserService,
    @inject(TYPES.JoiService) _joiService: IJoiService,
    @inject(TYPES.ErrorService) _errorService: IErrorService
  ) {
    this.userService = _userService;
    this.joiService = _joiService;
    this.errorService = _errorService;
  }

  @Query((returns) => UserPagingResult)
  @UseMiddleware(authenticate)
  async User(
    @Arg('input', { nullable: true }) args: UserQueryInput,
    @Ctx() ctx: any
  ): Promise<IPaginationData<User>> {
    const operation = 'User';

    try {
      const pagingArgs = Paging.createPagingPayload(args);
      let result: IPaginationData<User> = await this.userService.getAllAndCount(
        pagingArgs
      );
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

  @Mutation((returns) => User)
  @UseMiddleware(
    authenticate,
    authorize(RoleEnum.ClientAdmin, RoleEnum.SuperAdmin),
    canCreateSystemAdmin
  )
  async UserCreate(@Arg('input') args: UserCreateInput): Promise<User> {
    const operation = 'UserCreate';

    try {
      const email = args.email;
      const firstName = args.firstName;
      const lastName = args.lastName;
      const middleName = args.middleName;
      const phone = args.phone;
      const status = args.status;
      const client_id = args.client_id;
      const roles = args.roles;
      const record = args.record;
      const address = {
        streetAddress: args.address.streetAddress,
        aptOrSuite: args.address.aptOrSuite,
        city: args.address.city,
        state: args.address.state,
        zipcode: args.address.zipcode,
      };

      const schema = UserValidation.create();
      await this.joiService.validate({
        schema,
        input: {
          email,
          firstName,
          lastName,
          middleName,
          phone,
          client_id,
          address,
          roles,
          record,
        },
      });

      const user: User = await this.userService.create({
        email,
        firstName,
        lastName,
        middleName,
        status,
        phone,
        client_id,
        address,
        roles,
        record,
      });

      return user;
    } catch (err) {
      this.errorService.throwError({
        err,
        name: this.name,
        operation,
        logError: true,
      });
    }
  }

  @Mutation((returns) => User)
  @UseMiddleware(authenticate)
  async UserUpdate(@Arg('input') args: UserUpdateInput): Promise<User> {
    const operation = 'UserUpdate';

    try {
      const id = args.id;
      const firstName = args.firstName;
      const lastName = args.lastName;
      const middleName = args.middleName;
      const status = args.status;
      const phone = args.phone;
      const record = args.record;
      const address = args.address;

      const schema = UserValidation.update();
      await this.joiService.validate({
        schema,
        input: {
          id,
          firstName,
          lastName,
          middleName,
          phone,
          address,
          record,
        },
      });

      let user: User = await this.userService.update({
        id,
        firstName,
        lastName,
        middleName,
        status,
        phone,
        address,
        record,
      });

      return user;
    } catch (err) {
      this.errorService.throwError({
        err,
        name: this.name,
        operation,
        logError: true,
      });
    }
  }

  @Mutation((returns) => User)
  @UseMiddleware(authenticate)
  async ChangeProfilePicture(
    @Arg('input') args: ChangeProfilePictureInput,
    @Ctx() ctx: IGraphqlContext
  ) {
    const operation = 'Change Profile Picture';

    try {
      const id = args.id;
      const avatar_id = args.avatar_id;
      let user: User = await this.userService.changeProfilePicture({
        id,
        avatar_id,
      });
      return user;
    } catch (err) {
      throw err;
    }
  }

  @FieldResolver()
  fullName(@Root() root: User) {
    const middleName = root.middleName ? ` ${root.middleName}` : '';
    return `${root.firstName}${middleName} ${root.lastName}`;
  }

  @FieldResolver()
  client(@Root() root: User, @Ctx() ctx: IGraphqlContext) {
    if (root.client_id) {
      return ctx.loaders.clientByIdLoader.load(root.client_id);
    }

    return null;
  }

  @FieldResolver()
  roles(@Root() root: User, @Ctx() ctx: IGraphqlContext) {
    return ctx.loaders.rolesByUserIdLoader.load(root.id);
  }

  @FieldResolver()
  async avatar(@Root() root: User, @Ctx() ctx: IGraphqlContext) {
    if (root.avatar_id) {
      return await ctx.loaders.avatarByIdLoader.load(root.avatar_id);
    }
    return null;
  }

  @FieldResolver()
  async address(@Root() root: User, @Ctx() ctx: IGraphqlContext) {
    return await ctx.loaders.addressByUserIdLoader.load(root.id);
  }

  @FieldResolver()
  async record(@Root() root: User, @Ctx() ctx: IGraphqlContext) {
    return await ctx.loaders.recordByUserIdLoader.load(root.id);
  }
}
