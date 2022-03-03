import express, { Application } from 'express';

import schema from './graphql/schema';
import loaders from './loaders';

const app: Application = express();

app.use('/v1', express.static(`${__dirname}/../public`));
loaders({ app, schema });

export default app;
