import { Request, Response } from 'express';
import Dataloader from 'dataloader';

import User from '../entities/user.entity';
import Company from '../entities/company.entity';
import Role from '../entities/role.entity';
import { IUserAuth } from '../interfaces/auth.interface';
import Media from '../entities/media.entity';
import Address from '../entities/address.entity';
import UserRecord from '../entities/user-record.entity';

export interface IDataloader {
  companyByIdLoader: Dataloader<string, Company>;
  usersByCompanyIdLoader: Dataloader<string, User[]>;
  rolesByUserIdLoader: Dataloader<string, Role[]>;
  avatarByIdLoader: Dataloader<string, Media>;
  addressByUserIdLoader: Dataloader<string, Address>;
  recordByUserIdLoader: Dataloader<string, UserRecord>;
  usersByIdLoader: Dataloader<string, User>;
}

export interface IGraphqlContext {
  req: Request;
  res: Response;
  user: User | undefined;
  loaders: IDataloader;
}

export interface IGraphql {
  formatError(err: any): any;
  setContext(args: any): Promise<IGraphqlContext>;
}
