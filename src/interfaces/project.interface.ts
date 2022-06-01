import Project from '../entities/project.entity';
import { IPagingArgs, IGetAllAndCountResult, IPaginationData } from './paging.interface';
import { IEntityRemove, IEntityID } from './common.interface';
import { IGetOptions } from './paging.interface';
import { ProjectStatus } from '../config/constants';

export interface IProject {
  id: string;
  name: string;
  client_id: string;
  company_id: string;
  status: ProjectStatus;
  archived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IProjectCreateInput {
  name: IProject['name'];
  client_id: IProject['client_id'];
  company_id: IProject['company_id'];
  status?: IProject['status'];
  archived?: IProject['archived'];
}

export interface IProjectUpdateInput {
  id: IProject['id'];
  name: IProject['name'];
  status?: IProject['status'];
  archived?: IProject['archived'];
}

export interface IProjectRepository {
  getAllAndCount(args: IPagingArgs): Promise<IGetAllAndCountResult<Project>>;
  getAll(args: IGetOptions): Promise<Project[]>;
  getById(args: IEntityID): Promise<Project | undefined>;
  countEntities(args: IGetOptions): Promise<number>;
  create(args: IProjectCreateInput): Promise<Project>;
  update(args: IProjectUpdateInput): Promise<Project>;
  remove(args: IEntityRemove): Promise<Project>;
}

export interface IProjectService {
  getAllAndCount(args: IPagingArgs): Promise<IPaginationData<Project>>;
  create(args: IProjectCreateInput): Promise<Project>;
  update(args: IProjectUpdateInput): Promise<Project>;
  remove(args: IEntityRemove): Promise<Project>;
}
