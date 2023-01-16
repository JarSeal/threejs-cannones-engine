import { Router } from 'express';

import logger from '../utils/logger';
import config from '../utils/config';
import ERRORS from '../utils/errors';
import { validateProjectFolderAndSceneId } from '../utils/validation';
import { writeJsonFile } from '../utils/writeFile';

const router = Router();

router.post('/', async (request, response) => {
  const data = saveSceneData(request.body);
  return response.json(data);
});

export const saveSceneData = (sceneParams) => {
  const { projectFolder, sceneId } = sceneParams;
  const folderPath = config.PROJECTS_FOLDER_FROM_FS(projectFolder);
  const sceneFilePath = `${folderPath}/_data/scenes/${sceneId}.json`;

  const propsInvalid = validateProjectFolderAndSceneId({ projectFolder, sceneId });
  if (propsInvalid) return propsInvalid;

  try {
    // Write file
    sceneParams.dateSaved = new Date().getTime();
    writeJsonFile(sceneFilePath, sceneParams);
  } catch (err) {
    const error = ERRORS.couldNotFindOrWriteSceneFile;
    const errorMsg = error.errorMsg.replace('${path}', sceneFilePath);
    logger.error(error.errorMsg, err);
    return {
      error: true,
      errorCode: error.errorCode,
      errorMsg,
      sceneParams,
    };
  }
  return { saveComplete: true, sceneParams: { ...sceneParams, projectFolder } };
};

export default router;
