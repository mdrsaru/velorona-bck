import 'reflect-metadata';
import { Container, interfaces } from 'inversify';

import { app, logger, graphql, hash, error, joi, token, email, handlebars } from './config/inversify/common';
import company from './config/inversify/company';
import role from './config/inversify/role';
import user from './config/inversify/user';
import auth from './config/inversify/auth';
import userToken from './config/inversify/user-token';
import media from './config/inversify/media';
import task from './config/inversify/task';
import address from './config/inversify/address';
import project from './config/inversify/project';
import workschedule from './config/inversify/workschedule';
import timeEntry from './config/inversify/time-entry';
import userClient from './config/inversify/user-client';
import client from './config/inversify/client';
import userpayrate from './config/inversify/user-payrate';
import invoice from './config/inversify/invoice';
import invoiceItem from './config/inversify/invoice-item';
import timesheet from './config/inversify/timesheet';
import activityLog from './config/inversify/activityLog';

const container = new Container({ skipBaseClassChecks: true });

// prettier-ignore
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
  handlebars,
  task,
  address,
  project,
  workschedule,
  timeEntry,
  userClient,
  client,
  userpayrate,
  invoice,
  invoiceItem,
  timesheet,
  activityLog,
);

export default container;
