import 'reflect-metadata';
import { Container, interfaces } from 'inversify';

import client from './config/inversify/client';
import { app, logger, graphql, hash, error, joi } from './config/inversify/common';

const container = new Container();

container.load(app, logger, graphql, hash, error, joi, client);

export default container;
