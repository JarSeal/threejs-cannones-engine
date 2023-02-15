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

router.post('/project-data', async (request, response) => {
  const projectData = loadProjectData(request.body);
  if (projectData.error) {
    return response.json(projectData);
  }
  return response.json({
    scenes: projectData.scenes,
    images: projectData.images,
    models: projectData.models,
    globalTextures: projectData.textures,
    globalCubetextures: projectData.cubetextures,
    globalMaterials: projectData.materials,
  });
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

export const loadProjectData = ({
  amount,
  projectFolder,
  loadScenesData,
  loadImagesData,
  loadModelsData,
  loadTexturesData,
  loadCubetexturesData,
  loadMaterialsData,
}) => {
  if (!amount || amount < 1) amount = Infinity;
  const projectsPath = getProjectFolderPath();
  let projects = [];
  if (projectFolder) {
    // Load data from one project
    projects = [loadOneProjectFile(projectFolder)];
  } else {
    // Load data from all projects
    projects = loadRecentProjectsList({ amount: Infinity });
  }
  let scenes = [];
  let images = {};
  let models = {};
  let textures = {};
  let cubetextures = {};
  let materials = {};
  for (let i = 0; i < projects.length; i++) {
    const prj = projects[i];
    if (loadScenesData) {
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
      scenes = scenes
        .sort((a, b) => b.dateSaved - a.dateSaved)
        .filter((_, index) => index < amount);
    }
    if (loadImagesData) {
      const imagesFilePath = `${projectsPath}/${prj.projectFolder}/${APP_CONFIG.SINGLE_PROJECT_IMAGES_FOLDER}/images.json`;
      if (fs.existsSync(imagesFilePath)) {
        try {
          const rawdata = fs.readFileSync(imagesFilePath);
          images[prj.projectFolder] = JSON.parse(rawdata)
            .sort((a, b) => b.dateSaved - a.dateSaved)
            .filter((_, index) => index < amount);
          if (projectFolder) images = images[prj.projectFolder];
        } catch (err) {
          const error = getError('couldNotFindOrReadImagesFile', { path: imagesFilePath });
          logger.error(error.errorMsg, err);
          return { ...error, error: true };
        }
      }
    }
    if (loadModelsData) {
      // @TODO: add tests
      const modelsFilePath = `${projectsPath}/${prj.projectFolder}/${APP_CONFIG.SINGLE_PROJECT_MODELS_FOLDER}/models.json`;
      if (fs.existsSync(modelsFilePath)) {
        try {
          const rawdata = fs.readFileSync(modelsFilePath);
          models[prj.projectFolder] = JSON.parse(rawdata)
            .sort((a, b) => b.dateSaved - a.dateSaved)
            .filter((_, index) => index < amount);
          if (projectFolder) models = models[prj.projectFolder];
        } catch (err) {
          const error = getError('couldNotFindOrReadModelsFile', { path: modelsFilePath });
          logger.error(error.errorMsg, err);
          return { ...error, error: true };
        }
      }
    }
    if (loadTexturesData) {
      // @TODO: add tests
      const texturesFilePath = `${projectsPath}/${prj.projectFolder}/${APP_CONFIG.SINGLE_PROJECT_TEXTURES_FOLDER}/textures.json`;
      if (fs.existsSync(texturesFilePath)) {
        try {
          const rawdata = fs.readFileSync(texturesFilePath);
          textures[prj.projectFolder] = JSON.parse(rawdata)
            .sort((a, b) => b.dateSaved - a.dateSaved)
            .filter((_, index) => index < amount);
          if (projectFolder) textures = textures[prj.projectFolder];
        } catch (err) {
          const error = getError('couldNotFindOrReadTexturesFile', { path: texturesFilePath });
          logger.error(error.errorMsg, err);
          return { ...error, error: true };
        }
      }
    }
    if (loadCubetexturesData) {
      // @TODO: add tests
      const cubetexturesFilePath = `${projectsPath}/${prj.projectFolder}/${APP_CONFIG.SINGLE_PROJECT_CUBETEXTURES_FOLDER}/cubetextures.json`;
      if (fs.existsSync(cubetexturesFilePath)) {
        try {
          const rawdata = fs.readFileSync(cubetexturesFilePath);
          cubetextures[prj.projectFolder] = JSON.parse(rawdata)
            .sort((a, b) => b.dateSaved - a.dateSaved)
            .filter((_, index) => index < amount);
          if (projectFolder) cubetextures = cubetextures[prj.projectFolder];
        } catch (err) {
          const error = getError('couldNotFindOrReadCubetexturesFile', {
            path: cubetexturesFilePath,
          });
          logger.error(error.errorMsg, err);
          return { ...error, error: true };
        }
      }
    }
    if (loadMaterialsData) {
      // @TODO: add tests
      const materialsFilePath = `${projectsPath}/${prj.projectFolder}/${APP_CONFIG.SINGLE_PROJECT_MATERIALS_FOLDER}/materials.json`;
      if (fs.existsSync(materialsFilePath)) {
        try {
          const rawdata = fs.readFileSync(materialsFilePath);
          materials[prj.projectFolder] = JSON.parse(rawdata)
            .sort((a, b) => b.dateSaved - a.dateSaved)
            .filter((_, index) => index < amount);
          if (projectFolder) materials = materials[prj.projectFolder];
        } catch (err) {
          const error = getError('couldNotFindOrReadMaterialsFile', { path: materialsFilePath });
          logger.error(error.errorMsg, err);
          return { ...error, error: true };
        }
      }
    }
  }
  return { scenes, images, textures, cubetextures, materials, models };
};

export default router;
