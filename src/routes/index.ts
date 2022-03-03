import express from 'express';

import appRouter from './app';

const app: express.Application = express();

app.use('/', appRouter);

export default app;
