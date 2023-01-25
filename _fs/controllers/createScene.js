import fs from 'fs';
import { Router } from 'express';

import logger from '../utils/logger';
import { getProjectFolderPath } from '../utils/config';
import { getError } from '../utils/errors';
import { validateProjectFolderAndSceneId } from '../utils/validation';
import { updateProjectFile, writeJsonFile } from '../utils/writeFile';
import APP_CONFIG from '../../APP_CONFIG';
import { loadOneProjectFile } from './projectsAndScenesLists';

const router = Router();

router.post('/', async (request, response) => {
  const data = createNewScene(request.body);
  return response.json(data);
});

export const createNewScene = (params) => {
  const { projectFolder, sceneId, sceneParams } = params;

  const validation = validateProjectFolderAndSceneId({ projectFolder, sceneId });
  if (validation.error) {
    return validation;
  }

  const folderPath = getProjectFolderPath(projectFolder);
  const sceneFileFolder = `${folderPath}/${APP_CONFIG.SINGLE_PROJECT_SCENE_FILES_FOLDER}`;
  const sceneFilePath = `${sceneFileFolder}/${sceneId}.json`;

  // Check if scene file already exists
  if (fs.existsSync(sceneFilePath)) {
    const error = getError('sceneFileAlreadyExists', { sceneId });
    logger.error(error.errorMsg);
    return { ...error, error: true };
  }

  const curProject = loadOneProjectFile(projectFolder);
  if (curProject.error) {
    logger.error(curProject.errorMsg);
    return { ...curProject, error: true };
  }

  const timeNow = new Date().getTime();
  sceneParams.dateCreated = timeNow;
  sceneParams.dateSaved = timeNow;
  try {
    // Write scene file
    writeJsonFile(sceneFilePath, sceneParams);
  } catch (err) {
    const error = getError('couldNotCreateSceneFile', { path: sceneFilePath });
    logger.error(error.errorMsg, err, sceneParams);
    return { ...error, error: true, sceneParams };
  }

  try {
    // Update dateSaved for project file
    updateProjectFile(projectFolder, {
      dateSaved: timeNow,
      scenes: [...curProject.scenes, sceneId],
    });
  } catch (err) {
    const error = getError('couldNotUpdateProjectFile', { projectFolder });
    logger.error(error.errorMsg, err, sceneParams);
    return { ...error, error: true, sceneParams };
  }

  return { createComplete: true, sceneParams: { ...sceneParams, projectFolder } };
};

export default router;
