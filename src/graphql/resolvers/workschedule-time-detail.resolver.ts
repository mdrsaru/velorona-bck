import { inject, injectable } from 'inversify';
import { Arg, Ctx, Mutation, Query, Resolver, UseMiddleware } from 'type-graphql';
import WorkscheduleTimeDetail, {
  WorkscheduleTimeDetailPagingResult,
  WorkscheduleTimeDetailQueryInput,
  WorkscheduleTimeDetailUpdateInput,
} from '../../entities/workschedule-time-details.entity';
import { IErrorService, IJoiService } from '../../interfaces/common.interface';
import { IPaginationData } from '../../interfaces/paging.interface';
import { IWorkscheduleTimeDetailService } from '../../interfaces/workschedule-time-detail.interface';
import { TYPES } from '../../types';
import { Role as RoleEnum } from '../../config/constants';
import authorize from '../middlewares/authorize';
import authenticate from '../middlewares/authenticate';
import Paging from '../../utils/paging';
import { DeleteInput } from '../../entities/common.entity';

@injectable()
@Resolver((of) => WorkscheduleTimeDetail)
export class WorkscheduleTimeDetailResolver {
  private name = 'WorkscheduleTimeDetailResolver';
  private workscheduleTimeDetailService: IWorkscheduleTimeDetailService;
  private errorService: IErrorService;
  private joiService: IJoiService;

  constructor(
    @inject(TYPES.WorkscheduleTimeDetailService) workscheduleTimeDetailService: IWorkscheduleTimeDetailService,
    @inject(TYPES.ErrorService) errorService: IErrorService,
    @inject(TYPES.JoiService) _joiService: IJoiService
  ) {
    this.workscheduleTimeDetailService = workscheduleTimeDetailService;
    this.errorService = errorService;
    this.joiService = _joiService;
  }

  @Query((returns) => WorkscheduleTimeDetailPagingResult)
  @UseMiddleware(authenticate, authorize(RoleEnum.SuperAdmin, RoleEnum.CompanyAdmin, RoleEnum.Employee))
  async WorkscheduleTimeDetail(
    @Arg('input', { nullable: true }) args: WorkscheduleTimeDetailQueryInput,
    @Ctx() ctx: any
  ): Promise<IPaginationData<WorkscheduleTimeDetail>> {
    const operation = 'WorkscheduleTimeDetails';

    try {
      const pagingArgs = Paging.createPagingPayload(args);
      let result: IPaginationData<WorkscheduleTimeDetail> = await this.workscheduleTimeDetailService.getAllAndCount(
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

  @Mutation((returns) => WorkscheduleTimeDetail)
  @UseMiddleware(authenticate, authorize(RoleEnum.SuperAdmin, RoleEnum.CompanyAdmin))
  async WorkscheduleTimeDetailUpdate(
    @Arg('input') args: WorkscheduleTimeDetailUpdateInput,
    @Ctx() ctx: any
  ): Promise<WorkscheduleTimeDetail> {
    const operation = 'WorkscheduleUpdate';

    try {
      const id = args.id;
      const startTime = args.startTime;
      const endTime = args.endTime;
      const workschedule_detail_id = args.workschedule_detail_id;

      let workscheduleTimeDetail: WorkscheduleTimeDetail = await this.workscheduleTimeDetailService.update({
        id,
        startTime,
        endTime,
        workschedule_detail_id,
      });

      return workscheduleTimeDetail;
    } catch (err) {
      this.errorService.throwError({
        err,
        name: this.name,
        operation,
        logError: false,
      });
    }
  }

  @Mutation((returns) => WorkscheduleTimeDetail)
  @UseMiddleware(authenticate, authorize(RoleEnum.SuperAdmin, RoleEnum.CompanyAdmin))
  async WorkscheduleTimeDetailDelete(
    @Arg('input') args: DeleteInput,
    @Ctx() ctx: any
  ): Promise<WorkscheduleTimeDetail> {
    const operation = 'WorkscheduleDelete';

    try {
      const id = args.id;
      let workscheduleTimeDetail: WorkscheduleTimeDetail = await this.workscheduleTimeDetailService.remove({ id });

      return workscheduleTimeDetail;
    } catch (err) {
      this.errorService.throwError({
        err,
        name: this.name,
        operation,
        logError: false,
      });
    }
  }
}
