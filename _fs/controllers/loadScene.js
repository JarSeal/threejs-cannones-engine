import { Router } from 'express';
import fs from 'fs';

import logger from '../utils/logger';
import { getProjectFolderPath } from '../utils/config';
import ERRORS from '../utils/errors';
import { validateProjectFolderAndSceneId } from '../utils/validation';
import APP_CONFIG from '../../APP_CONFIG';

const router = Router();

router.post('/', async (request, response) => {
  const data = loadSceneData(request.body);
  return response.json(data);
});

export const loadSceneData = ({ projectFolder, sceneId }) => {
  const folderPath = getProjectFolderPath(projectFolder);
  const sceneFilePath = `${folderPath}/${APP_CONFIG.SINGLE_PROJECT_SCENE_FILES_FOLDER}/${sceneId}.json`;
  const validation = validateProjectFolderAndSceneId({
    projectFolder,
    sceneId,
    checkExistence: true,
  });

  if (validation.error) {
    return validation;
  }

  let data = {};
  try {
    const rawdata = fs.readFileSync(sceneFilePath);
    data = JSON.parse(rawdata);
  } catch (err) {
    const error = ERRORS.couldNotFindOrReadSceneFile;
    const errorMsg = error.errorMsg.replace('${path}', sceneFilePath);
    logger.error(error.errorMsg, err);
    return { error: true, errorCode: error.errorCode, errorMsg };
  }
  return { ...data, projectFolder };
};

export default router;
