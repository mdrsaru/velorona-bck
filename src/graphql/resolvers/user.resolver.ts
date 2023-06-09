import { inject, injectable } from 'inversify';
import { Resolver, Query, Ctx, Arg, Mutation, UseMiddleware, FieldResolver, Root } from 'type-graphql';

import { TYPES } from '../../types';
import { Role as RoleEnum } from '../../config/constants';
import Company from '../../entities/company.entity';
import Paging from '../../utils/paging';
import authenticate from '../middlewares/authenticate';
import authorize from '../middlewares/authorize';
import { canCreateSystemAdmin, isSelf, filterCompany } from '../middlewares/user';
import { checkCompanyAccess } from '../middlewares/company';
import UserValidation from '../../validation/user.validation';

import { PagingInput, DeleteInput, MessageResponse } from '../../entities/common.entity';
import User, {
  UserPagingResult,
  UserCreateInput,
  UserUpdateInput,
  UserQueryInput,
  ChangeProfilePictureInput,
  UserAdminCreateInput,
  UserArchiveOrUnArchiveInput,
  UserCountInput,
  UserCountByAdminInput,
  AttachProjectInput,
} from '../../entities/user.entity';

import { IPaginationData } from '../../interfaces/paging.interface';
import { IUserRepository, IUserService } from '../../interfaces/user.interface';
import { IGraphqlContext } from '../../interfaces/graphql.interface';
import { IErrorService, IJoiService } from '../../interfaces/common.interface';
import Media from '../../entities/media.entity';
import UserRepository from '../../tests/mock/user.repository';

@injectable()
@Resolver((of) => User)
export class UserResolver {
  private name = 'UserResolver';
  private userService: IUserService;
  private joiService: IJoiService;
  private errorService: IErrorService;
  private companyLoader: any;
  private loader: any;
  private userRepository: IUserRepository;

  constructor(
    @inject(TYPES.UserService) _userService: IUserService,
    @inject(TYPES.JoiService) _joiService: IJoiService,
    @inject(TYPES.ErrorService) _errorService: IErrorService,
    @inject(TYPES.UserRepository) _userRepository: IUserRepository
  ) {
    this.userService = _userService;
    this.joiService = _joiService;
    this.errorService = _errorService;
    this.userRepository = _userRepository;
  }

  @Query((returns) => UserPagingResult)
  @UseMiddleware(authenticate, filterCompany)
  async User(@Arg('input', { nullable: true }) args: UserQueryInput, @Ctx() ctx: any): Promise<IPaginationData<User>> {
    const operation = 'User';

    try {
      const pagingArgs = Paging.createPagingPayload(args);
      let result: IPaginationData<User> = await this.userService.getAllAndCount(pagingArgs);
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
  async UserCount(@Arg('input', { nullable: true }) args: UserCountInput, @Ctx() ctx: any): Promise<Number> {
    const operation = 'User';
    try {
      let result: Number = await this.userRepository.countEntities({ query: args });
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
  @UseMiddleware(authenticate, authorize(RoleEnum.SuperAdmin))
  async UserCountByAdmin(
    @Arg('input', { nullable: true }) args: UserCountByAdminInput,
    @Ctx() ctx: any
  ): Promise<Number> {
    const operation = 'User';
    try {
      let result: Number = await this.userRepository.countEntities({ query: args });
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

  @Mutation((returns) => User, { description: 'Create user related to company' })
  @UseMiddleware(authenticate, authorize(RoleEnum.CompanyAdmin, RoleEnum.SuperAdmin), checkCompanyAccess)
  async UserCreate(@Arg('input') args: UserCreateInput): Promise<User> {
    const operation = 'UserCreate';

    try {
      const email = args.email;
      const firstName = args.firstName;
      const lastName = args.lastName;
      const middleName = args.middleName;
      const phone = args.phone;
      const status = args.status;
      const company_id = args.company_id;
      const roles = args.roles;
      const entryType = args?.entryType;
      const startDate = args?.startDate;
      const endDate = args?.endDate;
      const timesheet_attachment = args?.timesheet_attachment;
      const manager_id = args?.manager_id;
      const designation = args.designation;
      const address = {
        country: args.address.country,
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
          company_id,
          address,
          roles,
          entryType,
          startDate,
          endDate,
          timesheet_attachment,
          designation,
        },
      });

      const user: User = await this.userService.create({
        email,
        firstName,
        lastName,
        middleName,
        status,
        phone,
        company_id,
        address,
        roles,
        entryType,
        startDate,
        endDate,
        timesheet_attachment,
        manager_id,
        designation,
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
  @UseMiddleware(authenticate, authorize(RoleEnum.CompanyAdmin, RoleEnum.SuperAdmin), canCreateSystemAdmin)
  async UserAdminCreate(@Arg('input') args: UserAdminCreateInput): Promise<User> {
    const operation = 'UserAdminCreate';

    try {
      const email = args.email;
      const firstName = args.firstName;
      const lastName = args.lastName;
      const middleName = args.middleName;
      const phone = args.phone;
      const status = args.status;
      const roles = args.roles;
      const address = {
        country: args.address.country,
        streetAddress: args.address.streetAddress,
        aptOrSuite: args.address.aptOrSuite,
        city: args.address.city,
        state: args.address.state,
        zipcode: args.address.zipcode,
      };

      const schema = UserValidation.createAdmin();
      await this.joiService.validate({
        schema,
        input: {
          email,
          firstName,
          lastName,
          middleName,
          phone,
          address,
          roles,
        },
      });

      const user: User = await this.userService.create({
        email,
        firstName,
        lastName,
        middleName,
        status,
        phone,
        address,
        roles,
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
  @UseMiddleware(authenticate, isSelf)
  async UserUpdate(@Arg('input') args: UserUpdateInput): Promise<User> {
    const operation = 'UserUpdate';

    try {
      const id = args.id;
      const firstName = args.firstName;
      const lastName = args.lastName;
      const middleName = args.middleName;
      const status = args.status;
      const phone = args.phone;
      const address = args.address;
      const entryType = args.entryType;
      const startDate = args.startDate;
      const endDate = args.endDate;
      const timesheet_attachment = args.timesheet_attachment;
      const manager_id = args.manager_id;
      const roles = args.roles;
      const designation = args.designation;
      const email = args.email;

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
          entryType,
          startDate,
          endDate,
          timesheet_attachment,
          designation,
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
        entryType,
        startDate,
        endDate,
        timesheet_attachment,
        manager_id,
        roles,
        designation,
        email,
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
  @UseMiddleware(authenticate, isSelf)
  async AttachProjectToUser(@Arg('input') args: AttachProjectInput): Promise<User> {
    const operation = 'UserUpdate';

    try {
      const user_id = args.user_id;
      const project_ids = args.project_ids;

      let user: any = await this.userService.attachProject({
        user_id,
        project_ids,
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
  @UseMiddleware(authenticate, authorize(RoleEnum.CompanyAdmin, RoleEnum.SuperAdmin), checkCompanyAccess)
  async UserArchiveOrUnArchive(@Arg('input') args: UserArchiveOrUnArchiveInput): Promise<User> {
    const operation = 'UserArchiveUnArchive';

    try {
      const id = args.id;
      const archived = args.archived;

      const schema = UserValidation.archive();
      await this.joiService.validate({
        schema,
        input: {
          id,
          archived,
        },
      });

      let user: User = await this.userService.userArchiveOrUnArchive({
        id,
        archived,
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
  @UseMiddleware(authenticate, isSelf)
  async ChangeProfilePicture(@Arg('input') args: ChangeProfilePictureInput, @Ctx() ctx: IGraphqlContext) {
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
  company(@Root() root: User, @Ctx() ctx: IGraphqlContext) {
    if (root.company_id) {
      return ctx.loaders.companyByIdLoader.load(root.company_id);
    }

    return null;
  }

  @FieldResolver()
  roles(@Root() root: User, @Ctx() ctx: IGraphqlContext) {
    return ctx.loaders.rolesByUserIdLoader.load(root.id);
  }

  @FieldResolver()
  avatar(@Root() root: User, @Ctx() ctx: IGraphqlContext) {
    if (root.avatar_id) {
      return ctx.loaders.avatarByIdLoader.load(root.avatar_id);
    }
    return null;
  }

  @FieldResolver()
  address(@Root() root: User, @Ctx() ctx: IGraphqlContext) {
    if (root.address_id) {
      return ctx.loaders.addressByIdLoader.load(root.address_id);
    }
    return null;
  }

  @FieldResolver()
  activeClient(@Root() root: User, @Ctx() ctx: IGraphqlContext) {
    return ctx.loaders.activeClientByUserIdLoader.load(root.id);
  }

  @FieldResolver()
  manager(@Root() root: User, @Ctx() ctx: IGraphqlContext) {
    if (root.manager_id) {
      return ctx.loaders.usersByIdLoader.load(root.manager_id);
    }

    return null;
  }
}
