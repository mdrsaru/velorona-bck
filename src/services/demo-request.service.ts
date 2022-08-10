import { injectable, inject } from 'inversify';

import {
  IDemoRequestCreateInput,
  IDemoRequestUpdateInput,
  IDemoRequestRepository,
  IDemoRequestService,
} from '../interfaces/demo-request.interface';
import DemoRequest from '../entities/demo-request.entity';
import Paging from '../utils/paging';
import { TYPES } from '../types';
import { IPagingArgs, IPaginationData } from '../interfaces/paging.interface';
import { IEntityRemove, IEntityID } from '../interfaces/common.interface';

@injectable()
export default class DemoRequestService implements IDemoRequestService {
  private demoRequestRepository: IDemoRequestRepository;

  constructor(@inject(TYPES.DemoRequestRepository) demoRequestRepository: IDemoRequestRepository) {
    this.demoRequestRepository = demoRequestRepository;
  }

  getAllAndCount = async (args: IPagingArgs): Promise<IPaginationData<DemoRequest>> => {
    try {
      const { rows, count } = await this.demoRequestRepository.getAllAndCount(args);

      const paging = Paging.getPagingResult({
        ...args,
        total: count,
      });

      return {
        paging,
        data: rows,
      };
    } catch (err) {
      throw err;
    }
  };

  create = async (args: IDemoRequestCreateInput): Promise<DemoRequest> => {
    try {
      const fullName = args.fullName;
      const email = args.email;
      const phone = args.phone;
      const jobTitle = args.jobTitle;
      const companyName = args.companyName;

      const demoRequest = await this.demoRequestRepository.create({
        fullName,
        email,
        phone,
        jobTitle,
        companyName,
      });

      return demoRequest;
    } catch (err) {
      throw err;
    }
  };

  update = async (args: IDemoRequestUpdateInput): Promise<DemoRequest> => {
    try {
      const id = args.id;
      const status = args.status;

      const demoRequest = await this.demoRequestRepository.update({
        id,
        status,
      });

      return demoRequest;
    } catch (err) {
      throw err;
    }
  };

  remove = async (args: IEntityRemove): Promise<DemoRequest> => {
    try {
      const id = args.id;

      const demoRequest = await this.demoRequestRepository.remove({
        id,
      });

      return demoRequest;
    } catch (err) {
      throw err;
    }
  };
}
