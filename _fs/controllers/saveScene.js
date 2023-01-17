import { Router } from 'express';

import logger from '../utils/logger';
import config from '../utils/config';
import ERRORS from '../utils/errors';
import { validateProjectFolderAndSceneId } from '../utils/validation';
import { updateProjectFile, writeJsonFile } from '../utils/writeFile';

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

  const recentDateSaved = sceneParams.dateSaved;

  try {
    // Write scene file and update project file
    sceneParams.dateSaved = new Date().getTime();
    writeJsonFile(sceneFilePath, sceneParams);
    updateProjectFile(projectFolder, { dateSaved: sceneParams.dateSaved });
  } catch (err) {
    sceneParams.dateSaved = recentDateSaved;
    const error = ERRORS.couldNotFindOrWriteSceneFile;
    const errorMsg = error.errorMsg.replace('${path}', sceneFilePath);
    logger.error(error.errorMsg, err, sceneParams);
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
