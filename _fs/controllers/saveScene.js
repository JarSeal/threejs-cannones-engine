import { Router } from 'express';

import logger from '../utils/logger';
import { getProjectFolderPath } from '../utils/config';
import { getError } from '../utils/errors';
import { validateProjectFolderAndSceneId } from '../utils/validation';
import { updateProjectFile, writeJsonFile } from '../utils/writeFile';
import APP_CONFIG from '../../APP_CONFIG';

const router = Router();

router.post('/', async (request, response) => {
  const data = saveSceneData(request.body);
  return response.json(data);
});

export const saveSceneData = (sceneParams) => {
  const { projectFolder, sceneId } = sceneParams;
  const folderPath = getProjectFolderPath(projectFolder);
  const sceneFilePath = `${folderPath}/${APP_CONFIG.SINGLE_PROJECT_SCENE_FILES_FOLDER}/${sceneId}.json`;

  const validation = validateProjectFolderAndSceneId({
    projectFolder,
    sceneId,
    checkExistence: true,
  });
  if (validation.error) {
    logger.error(validation.errorMsg);
    return { error: true, ...validation };
  }

  const recentDateSaved = sceneParams.dateSaved;

  // @TODO: compare the recentDateSaved time and the current dateSaved on FS file
  // and if the one on file is newer (bigger timestamp value), then warn the user
  // that the FS has a newer version of the scene and saving the new params would
  // overwrite those changes.

  sceneParams.dateSaved = new Date().getTime();

  try {
    // Write scene file
    writeJsonFile(sceneFilePath, sceneParams);
  } catch (err) {
    sceneParams.dateSaved = recentDateSaved;
    const error = getError('couldNotFindOrWriteSceneFile', { path: sceneFilePath });
    logger.error(error.errorMsg, err, sceneParams);
    return {
      ...error,
      error: true,
      sceneParams,
    };
  }

  try {
    // Update dateSaved for project file
    updateProjectFile(projectFolder, { dateSaved: sceneParams.dateSaved });
  } catch (err) {
    const error = getError('couldNotUpdateProjectFile', { projectFolder });
    logger.error(error.errorMsg, err, sceneParams);
    return {
      ...error,
      error: true,
      sceneParams,
    };
  }

  return { saveComplete: true, sceneParams: { ...sceneParams, projectFolder } };
};

export default router;
