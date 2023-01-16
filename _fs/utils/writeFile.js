import fs from 'fs';

import config from './config';

export const writeJsonFile = (path, data) => {
  const indentation = config.JSON_INDENTATION_VALUE;
  fs.writeFileSync(path, JSON.stringify(data, null, indentation) + '\n', {
    encoding: 'utf8',
    flag: 'w',
  });
};
