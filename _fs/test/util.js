import fs from 'fs';

import { getProjectFolderPath } from '../utils/config';

export const removeTestProjectsFolder = () => {
  // @CONSIDER: This is kinda risky... Maybe this should have some checks before it is done/removed
  const baseFolder = getProjectFolderPath();
  fs.rmSync(baseFolder, { recursive: true, force: true });
};
