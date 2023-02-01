import config from './config';

const info = (...params) => {
  if (config.ENV !== 'test') {
    console.log(...params);
  }
};

const log = (...params) => {
  if (config.ENV !== 'test') {
    console.log(...params);
  }
};

const warn = (...params) => {
  if (config.ENV !== 'test') {
    console.warn(...params);
  }
};

const error = (...params) => {
  if (config.ENV !== 'test') {
    console.error(...params);
  }
};

const logger = {
  info,
  error,
  log,
  warn,
};

export default logger;
