import express from 'express';
import 'express-async-errors';

import middleware from './utils/middleware.js';

const app = express();
process.env.TZ = 'Europe/London';

app.use(express.json());
app.use(middleware.requestLogger);
app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

export default app;
