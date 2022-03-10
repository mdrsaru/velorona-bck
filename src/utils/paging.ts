import { IPagingArgs, IPagingResult, IPagingResultArgs } from '../interfaces/paging.interface';

export default class Paging {
  static createPagingPayload(args: any): IPagingArgs {
    const skip = args?.paging?.skip ?? 0;
    const take = args?.paging?.take;
    let order: string | string[] = args?.paging?.order ?? [];
    const query: any = args?.query ?? {};

    if (typeof order === 'string') {
      order = [order];
    }

    let _order: any = {};

    order.forEach((s) => {
      let [field, orderBy] = s.split(':');
      _order[field] = orderBy;
    });

    return {
      skip,
      ...(take && { take }),
      order: _order,
      query,
    };
  }

  static getPagingResult(args: IPagingResultArgs): IPagingResult {
    const skip = args.skip || 0;
    const take = args.take || 10;
    const total = args.total;
    const endIndex = skip + take - 1;

    return {
      total,
      startIndex: skip,
      endIndex: endIndex > total - 1 ? total - 1 : endIndex,
      hasNextPage: skip + take < total ? true : false,
    };
  }
}
