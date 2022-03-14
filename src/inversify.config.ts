import 'reflect-metadata';
import { Container, interfaces } from 'inversify';

import { app, logger, graphql, hash, error, joi, token } from './config/inversify/common';
import client from './config/inversify/client';
import role from './config/inversify/role';
import user from './config/inversify/user';
import auth from './config/inversify/auth';

const container = new Container({ skipBaseClassChecks: true });

container.load(app, logger, graphql, hash, token, error, joi, client, role, user, auth);

export default container;
