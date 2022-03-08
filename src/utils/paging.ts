import { IPagingArgs, IPagingResult, IPagingResultArgs } from '../interfaces/paging.interface';

export default class Paging {
  static createPagingPayload(args: any): IPagingArgs {
    const skip = args?.paging?.skip ?? 0;
    const limit: number = args?.paging?.limit;
    let sort: string | string[] = args?.paging?.sort ?? [];
    const query: any = args?.query ?? {};

    if (typeof sort === 'string') {
      sort = [sort];
    }

    let _sort: { [key: string]: string } = {};

    sort.forEach((s) => {
      let [field, orderBy] = s.split(':');
      _sort[field] = orderBy;
    });

    return {
      skip: +skip,
      limit: +limit,
      sort: _sort,
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
