import { Router } from 'express';
import fs from 'fs';

import logger from '../utils/logger';
import config from '../utils/config';
import ERRORS from '../utils/errors';
import { validateProjectFolderAndSceneId } from '../utils/validation';

const router = Router();

router.post('/', async (request, response) => {
  const data = loadSceneData(request.body);
  return response.json(data);
});

export const loadSceneData = ({ projectFolder, sceneId }) => {
  const folderPath = config.PROJECTS_FOLDER_FROM_FS(projectFolder);
  const sceneFilePath = `${folderPath}/_data/scenes/${sceneId}.json`;
  const hasMissingProps = validateProjectFolderAndSceneId({ projectFolder, sceneId });

  if (hasMissingProps) return hasMissingProps;

  let data = {};
  try {
    const rawdata = fs.readFileSync(sceneFilePath);
    data = JSON.parse(rawdata);
  } catch (err) {
    const error = ERRORS.couldNotFindOrReadSceneFile;
    const errorMsg = error.errorMsg.replace('${path}', sceneFilePath);
    logger.error(error.errorMsg);
    return { error: true, errorCode: error.errorCode, errorMsg };
  }
  return { ...data, projectFolder };
};

export default router;
