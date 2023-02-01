import { Router } from 'express';
import fs from 'fs';

import APP_CONFIG from '../../APP_CONFIG';
import { getProjectFolderPath } from '../utils/config';
import logger from '../utils/logger';
import { getError } from '../utils/errors';
import { validateProjectFolder } from '../utils/validation';

const router = Router();

router.post('/recent-projects', async (request, response) => {
  const recentProjects = loadRecentProjectsList(request.body);
  return response.json(recentProjects);
});

export const loadRecentProjectsList = ({ amount }) => {
  if (!amount || amount < 1) amount = Infinity;
  const projectsPath = getProjectFolderPath();
  const directories = fs
    .readdirSync(projectsPath, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);
  const projects = directories
    .map((dir) => {
      const projectFilePath = `${projectsPath}/${dir}/project.json`;
      try {
        const rawdata = fs.readFileSync(projectFilePath);
        return JSON.parse(rawdata);
      } catch (err) {
        return false;
      }
    })
    .filter((p) => p)
    .sort((a, b) => b.dateSaved - a.dateSaved)
    .filter((_, index) => index < amount);
  return projects;
};

router.post('/recent-scenes', async (request, response) => {
  const recentScenes = loadRecentScenesList(request.body);
  if (recentScenes.error) {
    return response.json(recentScenes);
  }
  const scenes = recentScenes.scenes.sort((a, b) => b.dateSaved - a.dateSaved);
  return response.json({ scenes, images: recentScenes.images });
});

export const loadOneProjectFile = (projectFolder) => {
  const validation = validateProjectFolder(projectFolder);
  if (validation.error) {
    return validation;
  }

  const projectsPath = getProjectFolderPath();
  const projectFilePath = `${projectsPath}/${projectFolder}/project.json`;
  try {
    const rawdata = fs.readFileSync(projectFilePath);
    return JSON.parse(rawdata);
  } catch (err) {
    const error = getError('couldNotFindOrReadProjectFile', { path: projectFilePath });
    logger.error(error.errorMsg, err);
    return { ...error, error: true };
  }
};

export const loadRecentScenesList = ({ amount, projectFolder, loadImagesData }) => {
  if (!amount || amount < 1) amount = Infinity;
  const projectsPath = getProjectFolderPath();
  let projects = [];
  if (projectFolder) {
    // Load scenes from one project
    projects = [loadOneProjectFile(projectFolder)];
  } else {
    // Load scenes from all projects
    projects = loadRecentProjectsList({ amount: Infinity });
  }
  let scenes = [];
  let images = {};
  for (let i = 0; i < projects.length; i++) {
    const prj = projects[i];
    if (!prj.scenes) continue;
    for (let j = 0; j < prj.scenes.length; j++) {
      const sceneId = prj.scenes[j];
      const sceneFilePath = `${projectsPath}/${prj.projectFolder}/${APP_CONFIG.SINGLE_PROJECT_SCENE_FILES_FOLDER}/${sceneId}.json`;
      let sceneParams = null;
      try {
        const rawdata = fs.readFileSync(sceneFilePath);
        sceneParams = JSON.parse(rawdata);
      } catch (err) {
        const error = getError('couldNotFindOrReadSceneFile', { path: sceneFilePath });
        logger.error(error.errorMsg, err);
        return { ...error, error: true };
      }
      scenes.push({
        sceneId,
        sceneName: sceneParams.name,
        projectFolder: prj.projectFolder,
        projectName: prj.name,
        dateSaved: sceneParams.dateSaved,
      });
    }
    if (loadImagesData) {
      const imagesFilePath = `${projectsPath}/${prj.projectFolder}/${APP_CONFIG.SINGLE_PROJECT_IMAGES_FOLDER}/images.json`;
      if (fs.existsSync(imagesFilePath)) {
        try {
          const rawdata = fs.readFileSync(imagesFilePath);
          images[prj.projectFolder] = JSON.parse(rawdata);
        } catch (err) {
          const error = getError('couldNotFindOrReadImagesFile', { path: imagesFilePath });
          logger.error(error.errorMsg, err);
          return { ...error, error: true };
        }
      }
    }
  }
  scenes = scenes.sort((a, b) => b.dateSaved - a.dateSaved).filter((_, index) => index < amount);
  return { scenes, images };
};

export default router;
