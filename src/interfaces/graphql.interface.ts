import { Request, Response } from 'express';
import Dataloader from 'dataloader';

import User from '../entities/user.entity';
import Company from '../entities/company.entity';
import Role from '../entities/role.entity';
import Media from '../entities/media.entity';
import Address from '../entities/address.entity';
import UserRecord from '../entities/user-record.entity';
import Task from '../entities/task.entity';
import Project from '../entities/project.entity';
import Client from '../entities/client.entity';
import Invoice from '../entities/invoice.entity';
import InvoiceItem from '../entities/invoice-item.entity';

export interface IDataloader {
  companyByIdLoader: Dataloader<string, Company>;
  usersByCompanyIdLoader: Dataloader<string, User[]>;
  rolesByUserIdLoader: Dataloader<string, Role[]>;
  avatarByIdLoader: Dataloader<string, Media>;
  addressByIdLoader: Dataloader<string, Address>;
  recordByUserIdLoader: Dataloader<string, UserRecord>;
  usersByIdLoader: Dataloader<string, User>;
  tasksByIdLoader: Dataloader<string, Task>;
  projectByIdLoader: Dataloader<string, Project>;
  clientByIdLoader: Dataloader<string, Client>;
  tasksByProjectIdLoader: Dataloader<string, Task>;
  activeClientByUserIdLoader: Dataloader<string, Client>;
  itemsByInvoiceIdLoader: Dataloader<string, InvoiceItem[]>;
  invoicesByIdLoader: Dataloader<string, Invoice>;
  usersByTaskIdLoader: Dataloader<string, any>;
  attachmentsByTaskIdLoader: Dataloader<string, Media[]>;
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
