import 'reflect-metadata';
import { Container, interfaces } from 'inversify';

import { app, logger, graphql, hash, error, joi } from './config/inversify/common';
import client from './config/inversify/client';
import role from './config/inversify/role';
import user from './config/inversify/user';

const container = new Container({ skipBaseClassChecks: true });

container.load(app, logger, graphql, hash, error, joi, client, role, user);

export default container;
