export interface IUserRecord {
  startDate: Date;
  endDate: Date;
  payRate: number;
}

export interface IUserRecordCreateInput {
  startDate: Date;
  endDate: Date;
  payRate: number;
}

export interface IUserRecordUpdateInput {
  startDate?: Date;
  endDate?: Date;
  payRate?: number;
}
