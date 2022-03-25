import 'reflect-metadata';
import { Container, interfaces } from 'inversify';

import {
  app,
  logger,
  graphql,
  hash,
  error,
  joi,
  token,
  email,
  handlebars,
} from './config/inversify/common';
import client from './config/inversify/client';
import role from './config/inversify/role';
import user from './config/inversify/user';
import auth from './config/inversify/auth';
import userToken from './config/inversify/user-token';
import media from './config/inversify/media';
import invitation from './config/inversify/invitation';

const container = new Container({ skipBaseClassChecks: true });

container.load(
  app,
  logger,
  graphql,
  hash,
  token,
  email,
  error,
  joi,
  client,
  role,
  user,
  auth,
  userToken,
  media,
  invitation,
  handlebars
);

export default container;
