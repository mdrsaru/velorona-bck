import { injectable } from 'inversify';
import findIndex from 'lodash/findIndex';
import merge from 'lodash/merge';
import cloneDeep from 'lodash/cloneDeep';

import { IProjectRepository } from '../../interfaces/project.interface';

import config from '../../config/constants';
import strings from '../../config/strings';
import { generateUuid } from './utils';
import { projects } from '../mock/data';
import Paging from '../../utils/paging';
import Project from '../../entities/project.entity';
import * as apiError from '../../utils/api-error';

import { IEntityID, IEntityRemove, ISingleEntityQuery } from '../../interfaces/common.interface';
import {
  IProject,
  IProjectCreateInput,
  IProjectUpdateInput,
  IProjectCountInput,
  IActiveProjectCountInput,
  IAssignProjectToUsers,
} from '../../interfaces/project.interface';
import { IPaginationData, IPagingArgs, IGetAllAndCountResult, IGetOptions } from '../../interfaces/paging.interface';

const date = '2022-03-08T08:01:04.776Z';

@injectable()
export default class ProjectRepository implements IProjectRepository {
  public projects = cloneDeep(projects);

  getAllAndCount = (args: IPagingArgs): Promise<IGetAllAndCountResult<Project>> => {
    return Promise.resolve({
      count: this.projects.length,
      rows: this.projects as Project[],
    });
  };

  getAll = (args: any): Promise<Project[]> => {
    throw new Error('not implemented');
  };

  getById = (args: IEntityID): Promise<Project | undefined> => {
    throw new Error('not implemented');
  };

  countEntities = (args: IGetOptions): Promise<number> => {
    throw new Error('not implemented');
  };

  create = (args: IProjectCreateInput): Promise<Project> => {
    try {
      const project = new Project();

      project.id = generateUuid();
      project.name = args.name;
      project.company_id = args.company_id;
      project.client_id = args.client_id as string;
      project.createdAt = new Date();
      project.updatedAt = new Date();

      this.projects.push(project);

      return Promise.resolve(project);
    } catch (err) {
      throw err;
    }
  };

  update = (args: IProjectUpdateInput): Promise<Project> => {
    try {
      const id = args.id;

      const foundIndex = findIndex(this.projects, { id });

      if (foundIndex < 0) {
        throw new apiError.NotFoundError({
          details: [strings.projectNotFound],
        });
      }

      const update = merge(this.projects[foundIndex], {
        name: args.name,
      });

      this.projects[foundIndex] = update;

      return Promise.resolve(update);
    } catch (err) {
      throw err;
    }
  };

  remove = (args: IEntityRemove): Promise<Project> => {
    throw new Error('not implemented');
  };

  countProjectInvolved(args: IProjectCountInput): Promise<number> {
    throw new Error('not implemented');
  }

  countActiveProjectInvolved(args: IActiveProjectCountInput): Promise<number> {
    throw new Error('not implemented');
  }

  assignProjectToUsers(args: IAssignProjectToUsers): Promise<Project> {
    throw new Error('not implemented');
  }
}
