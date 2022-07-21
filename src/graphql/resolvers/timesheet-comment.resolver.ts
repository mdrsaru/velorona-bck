import { inject, injectable } from 'inversify';
import { Resolver, Query, Ctx, Arg, Mutation, UseMiddleware, FieldResolver, Root } from 'type-graphql';

import { TYPES } from '../../types';
import Paging from '../../utils/paging';
import User from '../../entities/user.entity';
import { Role as RoleEnum } from '../../config/constants';
import TimesheetCommentValidation from '../../validation/timesheet-comment.validation';
import authenticate from '../middlewares/authenticate';
import authorize from '../middlewares/authorize';
import { checkCompanyAccess } from '../middlewares/company';
import TimesheetComment, {
  TimesheetCommentPagingResult,
  TimesheetCommentQueryInput,
  TimesheetCommentCreateInput,
  TimesheetCommentUpdateInput,
  TimesheetCommentDeleteInput,
} from '../../entities/timesheet-comment.entity';
import { PagingInput, MessageResponse } from '../../entities/common.entity';

import { IPaginationData } from '../../interfaces/paging.interface';
import {
  ITimesheetComment,
  ITimesheetCommentService,
  ITimesheetCommentRepository,
} from '../../interfaces/timesheet-comment.interface';
import { IErrorService, IJoiService } from '../../interfaces/common.interface';
import { IGraphqlContext } from '../../interfaces/graphql.interface';

@injectable()
@Resolver((of) => TimesheetComment)
export class TimesheetCommentResolver {
  private name = 'TimesheetCommentResolver';
  private timesheetCommentService: ITimesheetCommentService;
  private joiService: IJoiService;
  private errorService: IErrorService;
  private timesheetCommentRepository: ITimesheetCommentRepository;

  constructor(
    @inject(TYPES.TimesheetCommentService) timesheetCommentService: ITimesheetCommentService,
    @inject(TYPES.JoiService) joiService: IJoiService,
    @inject(TYPES.ErrorService) errorService: IErrorService,
    @inject(TYPES.TimesheetCommentRepository) timesheetCommentRepository: ITimesheetCommentRepository
  ) {
    this.timesheetCommentService = timesheetCommentService;
    this.joiService = joiService;
    this.errorService = errorService;
    this.timesheetCommentRepository = timesheetCommentRepository;
  }

  @Query((returns) => TimesheetCommentPagingResult)
  @UseMiddleware(authenticate, checkCompanyAccess)
  async TimesheetComment(
    @Arg('input') args: TimesheetCommentQueryInput,
    @Ctx() ctx: any
  ): Promise<IPaginationData<TimesheetComment>> {
    const operation = 'TimesheetComment';

    try {
      const pagingArgs = Paging.createPagingPayload(args);
      let result: IPaginationData<TimesheetComment> = await this.timesheetCommentService.getAllAndCount(pagingArgs);

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

  @Mutation((returns) => TimesheetComment)
  @UseMiddleware(authenticate, authenticate, authorize(RoleEnum.SuperAdmin, RoleEnum.CompanyAdmin), checkCompanyAccess)
  async TimesheetCommentCreate(
    @Arg('input') args: TimesheetCommentCreateInput,
    @Ctx() ctx: IGraphqlContext
  ): Promise<TimesheetComment> {
    const operation = 'TimesheetCommentCreate';

    try {
      const comment = args.comment;
      const reply_id = args.reply_id;
      const timesheet_id = args.timesheet_id;
      let user_id = args.user_id;

      if (!user_id) {
        user_id = ctx.user?.id as string;
      }

      const schema = TimesheetCommentValidation.create();
      await this.joiService.validate({
        schema,
        input: {
          comment,
          reply_id,
          user_id,
          timesheet_id,
        },
      });

      let timesheetComment: TimesheetComment = await this.timesheetCommentService.create({
        comment,
        user_id,
        reply_id,
        timesheet_id,
      });

      return timesheetComment;
    } catch (err) {
      this.errorService.throwError({
        err,
        name: this.name,
        operation,
        logError: true,
      });
    }
  }

  @Mutation((returns) => TimesheetComment)
  @UseMiddleware(authenticate, authenticate, authorize(RoleEnum.SuperAdmin, RoleEnum.CompanyAdmin), checkCompanyAccess)
  async TimesheetCommentUpdate(
    @Arg('input') args: TimesheetCommentUpdateInput,
    @Ctx() ctx: any
  ): Promise<TimesheetComment> {
    const operation = 'TimesheetCommentUpdate';

    try {
      const id = args.id;
      const comment = args.comment;

      const schema = TimesheetCommentValidation.update();
      await this.joiService.validate({
        schema,
        input: {
          id,
          comment,
        },
      });

      let timesheetComment: TimesheetComment = await this.timesheetCommentService.update({
        id,
        comment,
      });

      return timesheetComment;
    } catch (err) {
      this.errorService.throwError({
        err,
        name: this.name,
        operation,
        logError: false,
      });
    }
  }

  @Mutation((returns) => TimesheetComment)
  @UseMiddleware(authenticate, authorize(RoleEnum.SuperAdmin, RoleEnum.CompanyAdmin), checkCompanyAccess)
  async TimesheetCommentDelete(
    @Arg('input') args: TimesheetCommentDeleteInput,
    @Ctx() ctx: any
  ): Promise<TimesheetComment> {
    const operation = 'TimesheetCommentDelete';

    try {
      const id = args.id;

      let timesheetComment: TimesheetComment = await this.timesheetCommentService.remove({ id });

      return timesheetComment;
    } catch (err) {
      this.errorService.throwError({
        err,
        name: this.name,
        operation,
        logError: false,
      });
    }
  }

  @FieldResolver()
  user(@Root() root: TimesheetComment, @Ctx() ctx: IGraphqlContext) {
    return ctx.loaders.usersByIdLoader.load(root.user_id);
  }

  @FieldResolver()
  replyCount(@Root() root: TimesheetComment, @Ctx() ctx: IGraphqlContext) {
    return ctx.loaders.replyCountByParentIdLoader.load(root.id);
  }
}
