import { define } from 'typeorm-seeding';

import Project from '../../../entities/project.entity';

define(Project, () => {
  const project = new Project();

  return project;
});
