export interface IOrder {
  [field: string]: string;
}

export interface IPagingArgs {
  skip?: number;
  take?: number;
  order?: any;
  query?: any;
}

// typeorm specific
export interface IGetOptions extends IPagingArgs {
  relations?: string[];
  select?: string[];
}

export interface IPagingResultArgs extends IPagingArgs {
  total: number;
}

export interface IPagingResult {
  total: number;
  startIndex: number;
  endIndex: number;
  hasNextPage: boolean;
}

export interface IPaginationData<T> {
  paging: IPagingResult;
  data: T[];
  activeEntry?: T;
}

export interface IGetAllAndCountResult<T> {
  count: number;
  rows: T[];
}
