import fs from 'fs';

import config from '../utils/config';

const globalTeardown = () => {
  console.log('Teardown test data');

  // @CONSIDER: This is kinda risky... Maybe this should have some checks before it is done/removed
  const baseFolder = config.PROJECTS_FOLDER_FROM_FS('').slice(0, -1);
  fs.rmSync(baseFolder, { recursive: true, force: true });

  console.log('Teardown complete');
};

export default globalTeardown;
