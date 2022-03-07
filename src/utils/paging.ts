import { IPagingArgs, IPagingResult, IPagingResultArgs } from '../interfaces/paging.interface';

export default class Paging {
  static getPagingArgs(args: any): IPagingArgs {
    let { skip = 0, limit = 50, sort = 'createdAt:desc', ...query } = args ?? {};

    let [field, orderBy] = sort.split(':');
    sort = { [field]: orderBy };
    if (limit > 150) {
      limit = 150;
    }

    return {
      skip: +skip,
      limit: +limit,
      sort,
      query,
    };
  }

  static getPagingResult(args: IPagingResultArgs): IPagingResult {
    const skip = args.skip || 0;
    const limit = args.limit || 10;
    const total = args.total;
    const endIndex = +skip + +limit - 1;

    return {
      total,
      startIndex: +skip,
      endIndex: endIndex > total - 1 ? total - 1 : endIndex,
      hasNextPage: skip + limit < total ? true : false,
    };
  }
}
