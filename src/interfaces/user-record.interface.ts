import UserRecord from '../entities/user-record.entity';

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

export interface IUserRecordRepository {
  getAll(args: any): Promise<UserRecord[]>;
}
