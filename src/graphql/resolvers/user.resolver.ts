import { inject, injectable } from 'inversify';
import { Resolver, Query, Ctx, Arg, Mutation, UseMiddleware, FieldResolver, Root } from 'type-graphql';

import { TYPES } from '../../types';
import { Role as RoleEnum } from '../../config/constants';
import Client from '../../entities/client.entity';
import Paging from '../../utils/paging';
import authenticate from '../middlewares/authenticate';
import { canCreateSystemAdmin } from '../middlewares/user';
import authorize from '../middlewares/authorize';
import UserValidation from '../../validation/user.validation';
import { PagingInput, DeleteInput, MessageResponse } from '../../entities/common.entity';
import User, { UserPagingResult, UserCreateInput, UserUpdateInput, UserQueryInput } from '../../entities/user.entity';

import { IPaginationData } from '../../interfaces/paging.interface';
import { IUserService } from '../../interfaces/user.interface';
import { IGraphqlContext } from '../../interfaces/graphql.interface';
import { IErrorService, IJoiService } from '../../interfaces/common.interface';

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
  @UseMiddleware(authenticate, authorize(RoleEnum.ClientAdmin, RoleEnum.SuperAdmin), canCreateSystemAdmin)
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
      const roles = args.roles;
      const address = {
        streetAddress: args.address.streetAddress,
        aptOrSuite: args.address.aptOrSuite,
        city: args.address.city,
        state: args.address.state,
        zipcode: args.address.zipcode,
      };
      const startDate = args?.record?.startDate;
      const endDate = args?.record?.endDate;
      const payRate = args?.record?.payRate;

      const record = {
        startDate: startDate,
        endDate: endDate,
        payRate: payRate,
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
          roles,
          startDate,
          endDate,
          payRate,
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
        roles,
        record,
      });

      return user;
    } catch (err) {
      this.errorService.throwError({ err, name: this.name, operation, logError: true });
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

      const address = {
        streetAddress: args.address.streetAddress,
        aptOrSuite: args.address.aptOrSuite,
        city: args.address.city,
        state: args.address.state,
        zipcode: args.address.zipcode,
      };

      const record = {
        startDate: args.record.startDate,
        endDate: args.record.endDate,
        payRate: args.record.payRate,
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

  @FieldResolver()
  roles(@Root() root: User, @Ctx() ctx: IGraphqlContext) {
    return ctx.loaders.rolesByUserIdLoader.load(root.id);
  }
}
