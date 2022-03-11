import { inject, injectable } from 'inversify';
import { Resolver, Query, Ctx, Arg, Mutation, UseMiddleware, FieldResolver, Root } from 'type-graphql';

import { TYPES } from '../../types';
import Client from '../../entities/client.entity';
import Paging from '../../utils/paging';
import UserValidation from '../../validation/user.validation';
import { IErrorService, IJoiService } from '../../interfaces/common.interface';
import { PagingInput, DeleteInput, MessageResponse } from '../../entities/common.entity';
import { IPaginationData } from '../../interfaces/paging.interface';
import { IUserService } from '../../interfaces/user.interface';
import { IGraphqlContext } from '../../interfaces/graphql.interface';
import User, { UserPagingResult, UserCreateInput, UserUpdateInput, UserQueryInput } from '../../entities/user.entity';

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
  async User(@Arg('input', { nullable: true }) args: UserQueryInput, @Ctx() ctx: any): Promise<IPaginationData<User>> {
    const operation = 'User';

    try {
      const pagingArgs = Paging.createPagingPayload(args);
      let result: IPaginationData<User> = await this.userService.getAllAndCount(pagingArgs);
      return result;
    } catch (err) {
      this.errorService.throwError({ err, name: this.name, operation, logError: true });
    }
  }

  @Mutation((returns) => User)
  async UserCreate(@Arg('input') args: UserCreateInput): Promise<User> {
    const operation = 'UserCreate';

    try {
      const email = args.email;
      const password = args.password;
      const firstName = args.firstName;
      const lastName = args.lastName;
      const middleName = args.middleName;
      const phone = args.phone;
      const status = args.status;
      const client_id = args.client_id;
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
          password,
          firstName,
          lastName,
          middleName,
          phone,
          client_id,
          address,
        },
      });

      let user: User = await this.userService.create({
        email,
        password,
        firstName,
        lastName,
        middleName,
        status,
        phone,
        client_id,
        address,
      });

      return user;
    } catch (err) {
      this.errorService.throwError({ err, name: this.name, operation, logError: true });
    }
  }

  @Mutation((returns) => User)
  async UserUpdate(@Arg('input') args: UserUpdateInput): Promise<User> {
    const operation = 'UserUpdate';

    try {
      const id = args.id;
      const firstName = args.firstName;
      const lastName = args.lastName;
      const middleName = args.middleName;
      const status = args.status;
      const phone = args.phone;

      const address = {
        streetAddress: args.address.streetAddress,
        aptOrSuite: args.address.aptOrSuite,
        city: args.address.city,
        state: args.address.state,
        zipcode: args.address.zipcode,
      };

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
      });

      return user;
    } catch (err) {
      this.errorService.throwError({ err, name: this.name, operation, logError: true });
    }
  }

  @FieldResolver()
  client(@Root() root: User, @Ctx() ctx: IGraphqlContext) {
    if (root.client_id) {
      return ctx.loaders.clientByIdLoader.load(root.client_id);
    }

    return null;
  }
}
