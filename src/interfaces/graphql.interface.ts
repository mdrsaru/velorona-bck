import { Request, Response } from 'express';
import Dataloader from 'dataloader';
import User from '../entities/user.entity';
import Client from '../entities/client.entity';
import Role from '../entities/role.entity';

export interface IDataloader {
  clientByIdLoader: Dataloader<string, Client>;
  usersByClientIdLoader: Dataloader<string, User[]>;
  rolesByUserIdLoader: Dataloader<string, Role[]>;
}

export interface IGraphqlContext {
  req: Request;
  res: Response;
  loaders: IDataloader;
}

export interface IGraphql {
  formatError(err: any): any;
  setContext(args: any): IGraphqlContext;
}
