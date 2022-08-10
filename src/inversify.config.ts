import 'reflect-metadata';
import { Container, interfaces } from 'inversify';

import { app, logger, graphql, hash, error, joi, token, email, handlebars, webhook } from './config/inversify/common';
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
import activityLog from './config/inversify/activity-log';
import subscription from './config/inversify/subscription';
import stripe from './config/inversify/stripe';
import attachedTimesheet from './config/inversify/attached-timesheet';
import workscheduleDetail from './config/inversify/workschedule-detail';
import workscheduleTimeDetail from './config/inversify/workschedule-time-detail';
import subscriptionPayment from './config/inversify/subscription-payment';
import timesheetComment from './config/inversify/timesheet-comment';
import invoicePaymentConfig from './config/inversify/invoice-payment-config';
import invoiceSchedule from './config/inversify/invoice-schedule';
import demoRequest from './config/inversify/demo-request';

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
  subscription,
  stripe,
  webhook,
  attachedTimesheet,
  workscheduleDetail,
  workscheduleTimeDetail,
  subscriptionPayment,
  timesheetComment,
  invoicePaymentConfig,
  invoiceSchedule,
  demoRequest,
);

export default container;
