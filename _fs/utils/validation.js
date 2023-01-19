import fs from 'fs';

import logger from '../utils/logger';
import ERRORS from '../utils/errors';
import { getProjectFolderPath } from './config';

export const validateProjectFolderAndSceneId = (props) => {
  const { projectFolder, sceneId } = props;
  if (!projectFolder || !sceneId) {
    const error = !projectFolder ? ERRORS.projectFolderParamMissing : ERRORS.sceneIdParamMissing;
    logger.error(error.errorMsg);
    return { error: true, errorCode: error.errorCode, errorMsg: error.errorMsg };
  }
  const folderPath = getProjectFolderPath(projectFolder);
  if (!fs.existsSync(folderPath)) {
    const error = ERRORS.couldNotFindProjectFolder;
    const errorMsg = error.errorMsg.replace('${path}', folderPath);
    logger.error(error.errorMsg);
    return { error: true, errorCode: error.errorCode, errorMsg };
  }
  return false;
};
