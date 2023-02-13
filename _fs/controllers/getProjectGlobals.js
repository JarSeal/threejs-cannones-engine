import { Router } from 'express';

import { loadRecentScenesList } from './projectsAndScenesLists';

const router = Router();

router.post('/', async (request, response) => {
  const projectFolder = request.body.projectFolder;
  const globalsData = getProjectGlobals({ projectFolder });
  if (globalsData.error) {
    return response.json(globalsData);
  }
  return response.json({
    scenes: globalsData.scenes.sort((a, b) => b.dateSaved - a.dateSaved),
    images: globalsData.images[projectFolder] || [],
    globalTextures: globalsData.textures[projectFolder] || [],
    globalMaterials: globalsData.materials[projectFolder] || [],
    globalModels: globalsData.models[projectFolder] || [],
  });
});

export const getProjectGlobals = ({ projectFolder }) => {
  const recentScenesAndImages = loadRecentScenesList({
    projectFolder,
    loadImagesData: true,
    loadTexturesData: true,
    loadMaterialsData: true,
    loadModelsData: true,
  });
  return recentScenesAndImages;
};

export default router;
