import fs from 'fs';

import logger from '../utils/logger';
import { getError } from '../utils/errors';
import { getProjectFolderPath } from './config';
import APP_CONFIG from '../../APP_CONFIG';

export const validateProjectFolderAndSceneId = (props) => {
  const { projectFolder, sceneId, checkExistence } = props;
  let validation = validateProjectFolder(projectFolder);
  if (validation.error) {
    logger.error(validation.errorMsg);
    return { error: true, ...validation };
  }
  validation = validateSceneId(sceneId);
  if (validation.error) {
    logger.error(validation.errorMsg);
    return { error: true, ...validation };
  }
  if (checkExistence) {
    const folderPath = getProjectFolderPath(projectFolder);
    if (!fs.existsSync(folderPath)) {
      const error = getError('couldNotFindProjectFolder', { path: folderPath });
      logger.error(error.errorMsg);
      return { error: true, ...error };
    }
  }
  return { error: false };
};

export const validateProjectFolder = (projectFolder) => {
  if (!projectFolder) {
    const error = getError('projectFolderParamMissing');
    logger.error(error.errorMsg);
    return { ...error, error: true };
  }
  const regex = new RegExp(APP_CONFIG.SIMPLE_ID_REGEX);
  if (!regex.test(projectFolder)) {
    const error = getError('projectFolderContainsInvalidChars');
    logger.error(error.errorMsg);
    return { ...error, error: true };
  }
  return { error: false };
};

export const validateSceneId = (sceneId) => {
  if (!sceneId) {
    const error = getError('sceneIdParamMissing');
    logger.error(error.errorMsg);
    return { ...error, error: true };
  }
  const regex = new RegExp(APP_CONFIG.SIMPLE_ID_REGEX);
  if (!regex.test(sceneId)) {
    const error = getError('sceneIdContainsInvalidChars');
    logger.error(error.errorMsg);
    return { ...error, error: true };
  }
  return { error: false };
};
