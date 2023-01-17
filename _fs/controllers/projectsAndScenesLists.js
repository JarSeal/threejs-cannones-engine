import { Router } from 'express';
import fs from 'fs';

import APP_CONFIG from '../../APP_CONFIG';
import config from '../utils/config';
import logger from '../utils/logger';
import ERRORS from '../utils/errors';

const router = Router();

router.post('/recent-projects', async (request, response) => {
  const recentProjects = loadRecentProjectsList(request.body);
  return response.json(recentProjects);
});

export const loadRecentProjectsList = ({ amount }) => {
  if (!amount || amount < 1) amount = Infinity;
  const projectsPath = config.PROJECTS_FOLDER_FROM_FS('').slice(0, -1);
  const directories = fs
    .readdirSync(projectsPath, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);
  const projects = directories
    .map((dir) => {
      try {
        const rawdata = fs.readFileSync(`${projectsPath}/${dir}/project.json`);
        return JSON.parse(rawdata);
      } catch (err) {
        return false;
      }
    })
    .filter((p) => p)
    .sort((a, b) => b.dateSaved - a.dateSaved)
    .filter((p, index) => index < amount);
  return projects;
};

router.post('/recent-scenes', async (request, response) => {
  const recentScenes = loadRecentScenesList(request.body);
  if (recentScenes.error) {
    return response.json(recentScenes);
  }
  const scenes = recentScenes.scenes.sort((a, b) => b.dateSaved - a.dateSaved);
  return response.json(scenes);
});

export const loadRecentScenesList = ({ amount }) => {
  if (!amount || amount < 1) amount = Infinity;
  const projectsPath = config.PROJECTS_FOLDER_FROM_FS('');
  const projects = loadRecentProjectsList({ amount: 0 });
  let scenes = [];
  for (let i = 0; i < projects.length; i++) {
    const prj = projects[i];
    if (!prj.scenes) continue;
    for (let j = 0; j < prj.scenes.length; j++) {
      const sceneId = prj.scenes[j];
      const sceneFilePath = `${projectsPath}${prj.projectFolder}/${APP_CONFIG.SINGLE_PROJECT_SCENE_FILES_FOLDER}/${sceneId}.json`;
      let sceneParams = null;
      try {
        const rawdata = fs.readFileSync(sceneFilePath);
        sceneParams = JSON.parse(rawdata);
      } catch (err) {
        const error = ERRORS.couldNotFindOrReadSceneFile;
        const errorMsg = error.errorMsg.replace('${path}', sceneFilePath);
        logger.error(error.errorMsg, err);
        return { error: true, errorCode: error.errorCode, errorMsg };
      }
      scenes.push({
        sceneId,
        sceneName: sceneParams.name,
        projectFolder: prj.projectFolder,
        projectName: prj.name,
        dateSaved: sceneParams.dateSaved,
      });
      if (scenes.length === amount) break;
    }
    if (scenes.length === amount) break;
  }
  return { scenes };
};

export default router;
