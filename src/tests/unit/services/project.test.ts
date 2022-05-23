import container from '../../../inversify.config';
import { TYPES } from '../../../types';

import { projects, companies, users } from '../../mock/data';
import strings from '../../../config/strings';
import * as apiError from '../../../utils/api-error';

import {
  IProjectRepository,
  IProjectService,
  IProjectCreateInput,
  IProjectUpdateInput,
} from '../../../interfaces/project.interface';
import ProjectRepository from '../../mock/project.repository';

describe('Project Service', () => {
  let projectService: IProjectService;
  beforeAll(() => {
    container.rebind<IProjectRepository>(TYPES.ProjectRepository).to(ProjectRepository);
    projectService = container.get<IProjectService>(TYPES.ProjectService);
  });

  afterAll(() => {
    container.unbindAll();
  });

  describe('getAllAndCount', () => {
    it('should have a defined project service instance', () => {
      expect(projectService).toBeDefined();
    });

    it('should return projects with pagination', async () => {
      const _projects = await projectService.getAllAndCount({});

      expect(_projects).toBeDefined();
      expect(_projects.data.length).toBe(projects.length);
    });
  });

  describe('create', () => {
    it('should create a new project', async () => {
      const args: IProjectCreateInput = {
        name: 'New Project',
        client_id: users[1].id,
        company_id: companies[0].id,
      };

      const project = await projectService.create(args);

      expect(project).toBeDefined();
      expect(project.id).toBeDefined();
    });
  });

  describe('update', () => {
    it('should throw not found error', async () => {
      const id = 'random uuid';
      const update: IProjectUpdateInput = {
        id,
        name: 'Updated Name',
      };

      let error: any;
      try {
        const updated = await projectService.update(update);
      } catch (err) {
        error = err;
      }

      expect(error).toBeInstanceOf(apiError.NotFoundError);
    });

    it('should update an existing project', async () => {
      const args: IProjectCreateInput = {
        name: 'New Project',
        client_id: users[1].id,
        company_id: companies[0].id,
      };

      const project = await projectService.create(args);

      const id = project.id;

      const update: IProjectUpdateInput = {
        id,
        name: 'Updated Name',
      };

      const updated = await projectService.update(update);

      expect(updated).toBeDefined();
      expect(updated.name).toBe(update.name);
    });
  });
});
