import { inject, injectable } from 'inversify';
import { Resolver, Query, Ctx, Arg, Mutation, UseMiddleware, FieldResolver, Root } from 'type-graphql';

import { TYPES } from '../../types';
import { Role as RoleEnum } from '../../config/constants';
import Company from '../../entities/company.entity';
import Paging from '../../utils/paging';
import authenticate from '../middlewares/authenticate';
import authorize from '../middlewares/authorize';
import { canCreateInvitation } from '../middlewares/invitation';
import InvitationValidation from '../../validation/invitation.validation';
import { PagingInput, DeleteInput, MessageResponse } from '../../entities/common.entity';

import Invitation, {
  InvitationPagingResult,
  InvitationCreateInput,
  InvitationRenewInput,
  InvitationQueryInput,
} from '../../entities/invitation.entity';
import { IPaginationData } from '../../interfaces/paging.interface';
import { IInvitationService } from '../../interfaces/invitation.interface';
import { IGraphqlContext } from '../../interfaces/graphql.interface';
import { IErrorService, IJoiService } from '../../interfaces/common.interface';

@injectable()
@Resolver((of) => Invitation)
export class InvitationResolver {
  private name = 'InvitationResolver';
  private invitationService: IInvitationService;
  private joiService: IJoiService;
  private errorService: IErrorService;
  private companyLoader: any;
  private loader: any;

  constructor(
    @inject(TYPES.InvitationService) _invitationService: IInvitationService,
    @inject(TYPES.JoiService) _joiService: IJoiService,
    @inject(TYPES.ErrorService) _errorService: IErrorService
  ) {
    this.invitationService = _invitationService;
    this.joiService = _joiService;
    this.errorService = _errorService;
  }

  @Query((returns) => InvitationPagingResult)
  @UseMiddleware(authenticate)
  async Invitation(@Arg('input') args: InvitationQueryInput, @Ctx() ctx: any): Promise<IPaginationData<Invitation>> {
    const operation = 'Invitation';

    try {
      const pagingArgs = Paging.createPagingPayload(args);
      let result: IPaginationData<Invitation> = await this.invitationService.getAllAndCount(pagingArgs);
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

  @Mutation((returns) => Invitation)
  @UseMiddleware(authenticate, authorize(RoleEnum.CompanyAdmin, RoleEnum.SuperAdmin), canCreateInvitation)
  async InvitationCreate(@Arg('input') args: InvitationCreateInput, @Ctx() ctx: IGraphqlContext): Promise<Invitation> {
    const operation = 'InvitationCreate';

    try {
      const email = args.email;
      const company_id = args.company_id;
      const role = args.role;
      const inviter_id = ctx?.user?.id as string;

      const schema = InvitationValidation.create();
      await this.joiService.validate({
        schema,
        input: {
          email,
          inviter_id,
          company_id,
          role,
        },
      });

      let invitation: Invitation = await this.invitationService.create({
        email,
        inviter_id,
        company_id,
        role,
      });

      return invitation;
    } catch (err) {
      this.errorService.throwError({
        err,
        name: this.name,
        operation,
        logError: true,
      });
    }
  }

  @Mutation((returns) => Invitation)
  @UseMiddleware(authenticate, authorize(RoleEnum.CompanyAdmin, RoleEnum.SuperAdmin))
  async InvitationRenew(@Arg('input') args: InvitationRenewInput): Promise<Invitation> {
    const operation = 'InvitationRenew';

    try {
      const id = args.id;

      let invitation: Invitation = await this.invitationService.renewInvitation({
        id,
      });

      return invitation;
    } catch (err) {
      this.errorService.throwError({
        err,
        name: this.name,
        operation,
        logError: true,
      });
    }
  }

  @FieldResolver()
  company(@Root() root: Invitation, @Ctx() ctx: IGraphqlContext) {
    if (root.company_id) {
      return ctx.loaders.companyByIdLoader.load(root.company_id);
    }

    return null;
  }

  @FieldResolver()
  inviter(@Root() root: Invitation, @Ctx() ctx: IGraphqlContext) {
    if (root.inviter_id) {
      return ctx.loaders.usersByIdLoader.load(root.inviter_id);
    }

    return null;
  }
}
