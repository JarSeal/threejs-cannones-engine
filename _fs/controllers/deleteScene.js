import fs from 'fs';
import { Router } from 'express';

import logger from '../utils/logger';
import { getProjectFolderPath } from '../utils/config';
import { getError } from '../utils/errors';
import { validateProjectFolderAndSceneId } from '../utils/validation';
import { updateProjectFile } from '../utils/writeFile';
import APP_CONFIG from '../../APP_CONFIG';
import { loadOneProjectFile } from './projectsAndScenesLists';

const router = Router();

router.post('/', async (request, response) => {
  const data = deleteScene(request.body);
  return response.json(data);
});

export const deleteScene = (params) => {
  const { projectFolder, sceneId } = params;

  // Validate projectFolder and sceneId
  const validation = validateProjectFolderAndSceneId({
    projectFolder,
    sceneId,
    checkExistance: true,
  });
  if (validation.error) {
    return validation;
  }

  const folderPath = getProjectFolderPath(projectFolder);
  const sceneFileFolder = `${folderPath}/${APP_CONFIG.SINGLE_PROJECT_SCENE_FILES_FOLDER}`;
  const sceneFilePath = `${sceneFileFolder}/${sceneId}.json`;

  // Check that the scene file exists
  if (!fs.existsSync(sceneFilePath)) {
    const error = getError('couldNotFindOrReadSceneFile', { sceneId });
    logger.error(error.errorMsg);
    return { ...error, error: true };
  }

  // Delete file
  try {
    fs.rmSync(sceneFilePath, { recursive: true, force: true });
  } catch (err) {
    const error = getError('couldNotDeleteSceneFile', { path: sceneFilePath });
    logger.error(error.errorMsg, err);
    return { ...error, error: true };
  }

  // Update project file
  try {
    const timeNow = new Date().getTime();
    const projectData = loadOneProjectFile(projectFolder);
    const updatedScenesList = projectData.scenes.filter((scn) => scn !== sceneId);
    updateProjectFile(projectFolder, { dateSaved: timeNow, scenes: updatedScenesList });
  } catch (err) {
    const error = getError('couldNotUpdateProjectFile', { projectFolder });
    logger.error(error.errorMsg, err);
    return { ...error, error: true };
  }

  // Return success message
  return { sceneDeleted: true, projectFolder, sceneId };
};

export default router;
