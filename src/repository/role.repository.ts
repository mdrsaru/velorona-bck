import { injectable } from 'inversify';
import { getRepository, Repository } from 'typeorm';

import Role from '../entities/role.entity';
import {
  IRoleCreate,
  IRoleRepository,
  IRoleUpdate,
} from '../interfaces/role.interface';
import BaseRepository from './base.repository';
import { NotFoundError } from '../utils/api-error';
import { merge } from 'lodash';

@injectable()
export default class RoleRepository
  extends BaseRepository<Role>
  implements IRoleRepository
{
  constructor() {
    super(getRepository(Role));
  }

  create(args: IRoleCreate): Promise<Role> {
    try {
      const name = args.name;
      const description = args.description;

      const role = this.repo.save({
        name,
        description,
      });
      return role;
    } catch (err) {
      throw err;
    }
  }

  update = async (args: IRoleUpdate): Promise<Role> => {
    try {
      const id = args?.id;
      const name = args.name;
      const description = args.description;
      const found = await this.getById({ id });
      if (!found) {
        throw new NotFoundError({
          details: ['Role not found'],
        });
      }
      const update = merge(found, {
        id,
        name,
        description,
      });
      let role = await this.repo.save(update);

      return role;
    } catch (err) {
      throw err;
    }
  };
}
