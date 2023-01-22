import fs from 'fs';
import { Router } from 'express';

import { getProjectFolderPath } from '../utils/config';
import { getError } from '../utils/errors';
import logger from '../utils/logger';
import { createProjectFolderStructure, writeJsonFile } from '../utils/writeFile';
import APP_CONFIG from '../../APP_CONFIG';
import { validateProjectFolderAndSceneId } from '../utils/validation';

const router = Router();

router.post('/', async (request, response) => {
  const data = createProject(request.body);
  return response.json(data);
});

export const createProject = (params) => {
  const { projectFolder, name: projectName, sceneId, sceneName, sceneParams } = params;
  const baseFolder = getProjectFolderPath();
  const folderPath = getProjectFolderPath(projectFolder);
  const sceneFilePath = `${folderPath}/${APP_CONFIG.SINGLE_PROJECT_SCENE_FILES_FOLDER}/${sceneId}.json`;
  const timeNow = new Date().getTime();

  const validation = validateProjectFolderAndSceneId({ projectFolder, sceneId });
  if (validation.error) {
    logger.error(validation.errorMsg);
    return { error: true, ...validation };
  }

  // Check if "Projects" folder exists and create it if it doesn't
  try {
    if (!fs.existsSync(baseFolder)) {
      fs.mkdirSync(baseFolder);
    }
  } catch (err) {
    const error = getError('couldNotCreateProjectsBaseFolder', { path: baseFolder });
    logger.error(error.errorMsg, err);
    return {
      ...error,
      error: true,
    };
  }

  // Check if projectFolder exists and fail if it does
  if (fs.existsSync(folderPath)) {
    const error = getError('projectFolderAlreadyExists', { path: folderPath, projectFolder });
    logger.error(error.errorMsg);
    return {
      ...error,
      error: true,
    };
  }

  // Create project folder structure
  try {
    createProjectFolderStructure(folderPath);
  } catch (err) {
    const error = getError('couldNotCreateProjectFolderStructure', {
      path: folderPath,
      projectFolder,
    });
    logger.error(error.errorMsg);
    return {
      ...error,
      error: true,
    };
  }

  // Create project.json file
  try {
    const projectFilePath = `${folderPath}/project.json`;
    const data = {
      projectFolder,
      name: projectName,
      rootScene: sceneId,
      scenes: [sceneId],
      dateCreated: timeNow,
      dateSaved: timeNow,
    };
    writeJsonFile(projectFilePath, data);
  } catch (err) {
    const error = getError('couldNotCreateProjectFile', {
      path: folderPath,
      projectFolder,
    });
    logger.error(error.errorMsg);
    return {
      ...error,
      error: true,
    };
  }

  // Create main scene file (default scene params)
  try {
    const data = {
      ...sceneParams,
      sceneId: sceneId,
      name: sceneName,
      dateCreated: timeNow,
      dateSaved: timeNow,
    };
    writeJsonFile(sceneFilePath, data);
  } catch (err) {
    const error = getError('couldNotCreateNewSceneFile', {
      path: sceneFilePath,
    });
    logger.error(error.errorMsg);
    return {
      ...error,
      error: true,
    };
  }

  // Return success
  return {
    projectCreated: true,
    projectFolder,
    sceneId,
  };
};

export default router;
