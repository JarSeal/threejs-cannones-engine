import fs from 'fs';

import logger from '../utils/logger';
import ERRORS from '../utils/errors';
import config from './config';

export const validateProjectFolderAndSceneId = (props) => {
  const { projectFolder, sceneId } = props;
  if (!projectFolder || !sceneId) {
    const error = !projectFolder ? ERRORS.projectFolderParamMissing : ERRORS.sceneIdParamMissing;
    logger.error(error.errorMsg);
    return { error: true, errorCode: error.errorCode, errorMsg: error.errorMsg };
  }
  const folderPath = config.PROJECTS_FOLDER_FROM_FS(projectFolder);
  if (!fs.existsSync(folderPath)) {
    const error = ERRORS.couldNotFindProjectFolder;
    const errorMsg = error.errorMsg.replace('${path}', folderPath);
    logger.error(error.errorMsg);
    return { error: true, errorCode: error.errorCode, errorMsg };
  }
  return false;
};
