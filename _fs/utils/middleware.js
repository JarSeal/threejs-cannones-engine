import logger from './logger.js';

const requestLogger = (request, response, next) => {
  logger.info('Method:', request.method);
  logger.info('Path:  ', request.path);
  logger.info('Body:  ', request.body);
  logger.info('---');
  next();
};

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' });
};

const errorHandler = (error, request, response, next) => {
  if (process.env.NODE_ENV !== 'test') {
    logger.error(error.message, request.session);
  }

  if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message, errors: error.errors });
  }

  next(error);
};

export default { requestLogger, unknownEndpoint, errorHandler };
