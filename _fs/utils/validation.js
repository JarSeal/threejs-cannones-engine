import fs from 'fs';

import logger from '../utils/logger';
import { getError } from '../utils/errors';
import { getProjectFolderPath } from './config';

export const validateProjectFolderAndSceneId = (props) => {
  const { projectFolder, sceneId } = props;
  if (!projectFolder || !sceneId) {
    const error = !projectFolder
      ? getError('projectFolderParamMissing')
      : getError('sceneIdParamMissing');
    logger.error(error.errorMsg);
    return { error: true, errorCode: error.errorCode, errorMsg: error.errorMsg };
  }
  const folderPath = getProjectFolderPath(projectFolder);
  if (!fs.existsSync(folderPath)) {
    const error = getError('couldNotFindProjectFolder', { path: folderPath });
    logger.error(error.errorMsg);
    return { error: true, ...error };
  }
  return false;
};
