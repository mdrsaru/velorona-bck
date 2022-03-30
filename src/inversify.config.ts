import 'reflect-metadata';
import { Container, interfaces } from 'inversify';

import { app, logger, graphql, hash, error, joi, token, email, handlebars } from './config/inversify/common';
import company from './config/inversify/company';
import role from './config/inversify/role';
import user from './config/inversify/user';
import auth from './config/inversify/auth';
import userToken from './config/inversify/user-token';
import media from './config/inversify/media';
import invitation from './config/inversify/invitation';
import task from './config/inversify/task';
import address from './config/inversify/address';
import userRecord from './config/inversify/user-record';

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
  company,
  role,
  user,
  auth,
  userToken,
  media,
  invitation,
  handlebars,
  task,
  address,
  userRecord
);

export default container;
