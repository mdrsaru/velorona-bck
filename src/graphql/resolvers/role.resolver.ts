import { inject, injectable } from 'inversify';
import { Arg, Ctx, Mutation, Query, Resolver, UseMiddleware } from 'type-graphql';

import { TYPES } from '../../types';
import Paging from '../../utils/paging';
import authenticate from '../middlewares/authenticate';
import authorize from '../middlewares/authorize';
import { Role as RoleEnum } from '../../config/constants';
import RoleValidation from '../../validation/role.validation';
import { DeleteInput } from '../../entities/common.entity';
import Role, { RoleCreateInput, RolePagingResult, RoleQueryInput, RoleUpdateInput } from '../../entities/role.entity';

import { IPaginationData } from '../../interfaces/paging.interface';
import { IErrorService, IJoiService } from '../../interfaces/common.interface';
import { IRole, IRoleService } from '../../interfaces/role.interface';

@injectable()
@Resolver()
export class RoleResolver {
  private name = 'RoleResolver';
  private roleService: IRoleService;
  private joiService: IJoiService;
  private errorService: IErrorService;

  constructor(
    @inject(TYPES.RoleService) roleService: IRoleService,
    @inject(TYPES.JoiService) joiService: IJoiService,
    @inject(TYPES.ErrorService) errorService: IErrorService
  ) {
    this.roleService = roleService;
    this.joiService = joiService;
    this.errorService = errorService;
  }

  @Query((returns) => RolePagingResult)
  @UseMiddleware(authenticate)
  async Role(@Arg('input', { nullable: true }) args: RoleQueryInput, @Ctx() ctx: any): Promise<IPaginationData<Role>> {
    const operation = 'Roles';

    try {
      const pagingArgs = Paging.createPagingPayload(args);
      let result: IPaginationData<Role> = await this.roleService.getAllAndCount(pagingArgs);
      return result;
    } catch (err) {
      this.errorService.throwError({ err, name: this.name, operation, logError: true });
    }
  }

  @Mutation((returns) => Role)
  @UseMiddleware(authenticate, authorize(RoleEnum.SuperAdmin))
  async RoleCreate(@Arg('input') args: RoleCreateInput, @Ctx() ctx: any): Promise<Role> {
    const operation = 'RoleCreate';
    try {
      const name = args.name;
      const description = args.description;

      const schema = RoleValidation.create();
      await this.joiService.validate({
        schema,
        input: {
          name,
          description,
        },
      });
      let role: Role = await this.roleService.create({
        name,
        description,
      });
      return role;
    } catch (err) {
      this.errorService.throwError({ err, name: this.name, operation, logError: false });
    }
  }

  @Mutation((returns) => Role)
  @UseMiddleware(authenticate, authorize(RoleEnum.SuperAdmin))
  async RoleUpdate(@Arg('input') args: RoleUpdateInput, @Ctx() ctx: any): Promise<IRole> {
    const operation = 'RoleUpdate';

    try {
      const id = args.id;
      const name = args.name;
      const description = args.description;

      const schema = RoleValidation.update();
      await this.joiService.validate({
        schema,
        input: {
          id,
          name,
          description,
        },
      });

      let role: Role = await this.roleService.update({
        id,
        name,
        description,
      });

      return role;
    } catch (err) {
      this.errorService.throwError({ err, name: this.name, operation, logError: false });
    }
  }

  @Mutation((returns) => Role)
  @UseMiddleware(authenticate, authorize(RoleEnum.SuperAdmin))
  async RoleDelete(@Arg('input') args: DeleteInput, @Ctx() ctx: any): Promise<Role> {
    const operation = 'RoleDelete';

    try {
      const id = args.id;
      let role: Role = await this.roleService.remove({ id });

      return role;
    } catch (err) {
      this.errorService.throwError({ err, name: this.name, operation, logError: false });
    }
  }
}
