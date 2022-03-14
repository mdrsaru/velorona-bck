import Role from '../entities/role.entity';
import { IEntityID, IEntityRemove } from './common.interface';
import { IGetAllAndCountResult, IPaginationData, IPagingArgs } from './paging.interface';
import { Role as RoleEnum } from '../config/constants';

export interface IRole {
  id: string;
  name: RoleEnum;
  description?: string;
}

export interface IRoleCreate {
  name: IRole['name'];
  description: IRole['description'];
}
export interface IRoleUpdate {
  id: string;
  name: IRole['name'];
  description: IRole['description'];
}

export interface IRoleRepository {
  getAllAndCount(args: IPagingArgs): Promise<IGetAllAndCountResult<Role>>;
  getAll(args: any): Promise<Role[]>;
  getById(args: IEntityID): Promise<Role | undefined>;
  create(args: IRoleCreate): Promise<Role>;
  update(args: IRoleUpdate): Promise<Role>;
  remove(args: IEntityRemove): Promise<Role>;
}
export interface IRoleService {
  getAllAndCount(filters?: any): Promise<IPaginationData<Role>>;
  create(args: IRoleCreate): Promise<Role>;
  update(args: IRoleUpdate): Promise<Role>;
  remove(args: IEntityRemove): Promise<Role>;
}
