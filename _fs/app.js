import express from 'express';
import 'express-async-errors';
import cors from 'cors';

import middleware from './utils/middleware.js';

import loadSceneRouter from './controllers/loadScene.js';
import saveSceneRouter from './controllers/saveScene.js';
import projectsAndScenesLists from './controllers/projectsAndScenesLists.js';

const app = express();
process.env.TZ = 'Europe/London'; // @TODO: add ForThree setting for this

app.use(
  cors({
    origin: '*',
  })
);

app.use(express.json());
app.use(middleware.requestLogger);

app.use('/api/load-scene', loadSceneRouter);
app.use('/api/save-scene', saveSceneRouter);
app.use('/api/projects-and-scenes-lists', projectsAndScenesLists);

app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

export default app;
