export interface ISort {
  [field: string]: string;
}

export interface IPagingArgs {
  skip?: number;
  limit?: number;
  sort?: ISort;
  query?: any;
}

export interface IPagingResult {
  total: number;
  startIndex: number;
  endIndex: number;
  hasNextPage: boolean;
}

export interface IPaginationData<T> {
  paging: IPagingResult;
  data: T;
}

export interface IGetAllAndCountResult<T> {
  count: number;
  rows: T;
}
