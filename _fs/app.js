import express from 'express';
import 'express-async-errors';
import cors from 'cors';

import middleware from './utils/middleware.js';

import loadSceneRouter from './controllers/loadScene.js';

const app = express();
process.env.TZ = 'Europe/London';

app.use(
  cors({
    origin: '*',
  })
);

app.use(express.json());
app.use(middleware.requestLogger);

app.use('/api/load-scene', loadSceneRouter);

app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

export default app;
