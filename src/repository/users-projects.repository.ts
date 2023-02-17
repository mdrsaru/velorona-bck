import { inject, injectable } from 'inversify';
import { getRepository } from 'typeorm';
import BaseRepository from './base.repository';

import { TYPES } from '../types';
import strings from '../config/strings';
import User from '../entities/user.entity';
import { UserProjectStatus } from '../config/constants';

import { IUserRepository } from '../interfaces/user.interface';
import { IClientRepository } from '../interfaces/client.interface';
import { merge } from 'lodash';
import UserProject from '../entities/user-project.entity';
import { IProjectRepository } from '../interfaces/project.interface';
import {
  IUserProjectChangeStatus,
  IUserProjectMakeInactive,
  IUserProjectRepository,
} from '../interfaces/user-project.interface';

import * as apiError from '../utils/api-error';

@injectable()
export default class UserProjectRepository extends BaseRepository<UserProject> implements IUserProjectRepository {
  private userRepository: IUserRepository;

  constructor(
    @inject(TYPES.UserRepository) _userRepository: IUserRepository,
    @inject(TYPES.ClientRepository) _clientRepository: IClientRepository,
    @inject(TYPES.ProjectRepository) _projectRepository: IProjectRepository
  ) {
    super(getRepository(UserProject));
    this.userRepository = _userRepository;
  }

  update = async (args: IUserProjectChangeStatus): Promise<UserProject> => {
    try {
      const project_id = args.project_id;
      const user_id = args.user_id;
      const status = args.status;

      const found = await this.getSingleEntity({
        query: {
          project_id,
          user_id,
        },
      });

      if (found) {
        await this.changeStatusToInactive({
          user_id,
        });
      }
      const update = merge(found, {
        user_id,
        project_id,
        status,
      });
      let userProjectFound = await this.repo.save(update);
      return userProjectFound;
    } catch (err) {
      throw err;
    }
  };

  changeStatusToInactive = async (args: IUserProjectMakeInactive): Promise<User> => {
    try {
      const user_id = args.user_id;

      let user = await this.userRepository.getById({ id: user_id, relations: ['roles'] });

      if (!user) {
        throw new apiError.NotFoundError({ details: [strings.userNotFound] });
      }

      await this.repo.update({ user_id }, { status: UserProjectStatus.Inactive });

      return user;
    } catch (err) {
      throw err;
    }
  };
}
