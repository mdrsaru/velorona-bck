import { inject, injectable } from 'inversify';
import { Arg, Ctx, FieldResolver, Mutation, Query, Resolver, Root, UseMiddleware } from 'type-graphql';
import AttachedTimesheet, {
  AttachedTimesheetCreateInput,
  AttachedTimesheetPagingResult,
  AttachedTimesheetQueryInput,
  AttachedTimesheetUpdateInput,
} from '../../entities/attached-timesheet.entity';
import { IAttachedTimesheetService } from '../../interfaces/attached-timesheet.interface';
import { IErrorService, IJoiService } from '../../interfaces/common.interface';
import { IGraphqlContext } from '../../interfaces/graphql.interface';
import { IPaginationData } from '../../interfaces/paging.interface';
import { TYPES } from '../../types';
import Paging from '../../utils/paging';
import authenticate from '../middlewares/authenticate';
import authorize from '../middlewares/authorize';
import { checkCompanyAccess, checkPlan, checkTrialPeriod } from '../middlewares/company';
import { plans, Role as RoleEnum } from '../../config/constants';
import AttachedTimesheetValidation from '../../validation/attached-timesheet.validation';
import { DeleteInput } from '../../entities/common.entity';
import { timesheetByIdLoader } from '../../loaders/dataloader/timesheet.dataloader';

@injectable()
@Resolver((of) => AttachedTimesheet)
export class AttachedTimesheetResolver {
  private name = 'AttachedTimesheetResolver';
  private attachedTimesheetService: IAttachedTimesheetService;
  private errorService: IErrorService;
  private joiService: IJoiService;

  constructor(
    @inject(TYPES.AttachedTimesheetService) _attachedTimesheetService: IAttachedTimesheetService,
    @inject(TYPES.ErrorService) errorService: IErrorService,
    @inject(TYPES.JoiService) joiService: IJoiService
  ) {
    this.attachedTimesheetService = _attachedTimesheetService;
    this.errorService = errorService;
    this.joiService = joiService;
  }

  @Query((returns) => AttachedTimesheetPagingResult)
  @UseMiddleware(authenticate, checkCompanyAccess, checkPlan(plans.Professional), checkTrialPeriod)
  async AttachedTimesheet(
    @Arg('input') args: AttachedTimesheetQueryInput,
    @Ctx() ctx: any
  ): Promise<IPaginationData<AttachedTimesheet>> {
    const operation = 'AttachedTimesheets';

    try {
      const pagingArgs = Paging.createPagingPayload(args);
      let result: IPaginationData<AttachedTimesheet> = await this.attachedTimesheetService.getAllAndCount(pagingArgs);

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

  @Mutation((returns) => AttachedTimesheet)
  @UseMiddleware(
    authenticate,
    authenticate,
    authorize(RoleEnum.SuperAdmin, RoleEnum.CompanyAdmin, RoleEnum.Employee),
    checkCompanyAccess,
    checkPlan(plans.Professional),
    checkTrialPeriod
  )
  async AttachedTimesheetCreate(
    @Arg('input') args: AttachedTimesheetCreateInput,
    @Ctx() ctx: any
  ): Promise<AttachedTimesheet> {
    const operation = 'AttachedTimesheetCreate';
    try {
      const description = args.description;
      const attachment_id = args.attachment_id;
      const company_id = args.company_id;
      const created_by = ctx?.user?.id;
      const timesheet_id = args.timesheet_id;
      const invoice_id = args.invoice_id;
      const type = args.type;
      const amount = args.amount;
      const date = args.date;

      const schema = AttachedTimesheetValidation.create();
      await this.joiService.validate({
        schema,
        input: {
          description,
          attachment_id,
          company_id,
          timesheet_id,
          invoice_id,
          type,
          amount,
          date,
        },
      });

      let AttachedTimesheet: AttachedTimesheet = await this.attachedTimesheetService.create({
        description,
        attachment_id,
        company_id,
        created_by,
        timesheet_id,
        invoice_id,
        type,
        amount,
        date,
      });

      return AttachedTimesheet;
    } catch (err) {
      this.errorService.throwError({
        err,
        name: this.name,
        operation,
        logError: true,
      });
    }
  }

  @Mutation((returns) => AttachedTimesheet)
  @UseMiddleware(
    authenticate,
    authenticate,
    authorize(RoleEnum.SuperAdmin, RoleEnum.CompanyAdmin, RoleEnum.Employee),
    checkCompanyAccess,
    checkPlan(plans.Professional),
    checkTrialPeriod
  )
  async AttachedTimesheetUpdate(
    @Arg('input') args: AttachedTimesheetUpdateInput,
    @Ctx() ctx: any
  ): Promise<AttachedTimesheet> {
    const operation = 'AttachedTimesheetUpdate';

    try {
      const id = args.id;
      const description = args?.description;
      const attachment_id = args?.attachment_id;
      const type = args.type;
      const amount = args.amount;
      const date = args.date;

      const schema = AttachedTimesheetValidation.update();
      await this.joiService.validate({
        schema,
        input: {
          id,
          description,
          attachment_id,
          type,
          amount,
          date,
        },
      });

      let AttachedTimesheet: AttachedTimesheet = await this.attachedTimesheetService.update({
        id,
        description,
        attachment_id,
        type,
        amount,
        date,
      });

      return AttachedTimesheet;
    } catch (err) {
      this.errorService.throwError({
        err,
        name: this.name,
        operation,
        logError: true,
      });
    }
  }

  @Mutation((returns) => AttachedTimesheet)
  @UseMiddleware(authenticate, checkPlan(plans.Professional), checkTrialPeriod)
  async AttachedTimesheetDelete(@Arg('input') args: DeleteInput, @Ctx() ctx: any): Promise<AttachedTimesheet> {
    const operation = 'AttachedTimesheetDelete';

    try {
      const id = args.id;
      let attachedTimesheet: AttachedTimesheet = await this.attachedTimesheetService.remove({ id });

      return attachedTimesheet;
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
  async attachments(@Root() root: AttachedTimesheet, @Ctx() ctx: IGraphqlContext) {
    if (root.attachment_id) {
      return await ctx.loaders.avatarByIdLoader.load(root.attachment_id);
    }
  }

  @FieldResolver()
  async company(@Root() root: AttachedTimesheet, @Ctx() ctx: IGraphqlContext) {
    return await ctx.loaders.companyByIdLoader.load(root.company_id);
  }

  @FieldResolver()
  async creator(@Root() root: AttachedTimesheet, @Ctx() ctx: IGraphqlContext) {
    return await ctx.loaders.usersByIdLoader.load(root.created_by);
  }

  @FieldResolver()
  async timesheet(@Root() root: AttachedTimesheet, @Ctx() ctx: IGraphqlContext) {
    if (root.timesheet_id) {
      return await ctx.loaders.timesheetByIdLoader.load(root.timesheet_id);
    }
  }
}
