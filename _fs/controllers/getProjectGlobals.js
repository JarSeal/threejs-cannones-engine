import { Router } from 'express';

import { loadRecentScenesList } from './projectsAndScenesLists';

const router = Router();

router.post('/', async (request, response) => {
  const globalsData = getProjectGlobals(request.body);
  if (globalsData.error) {
    return response.json(globalsData);
  }
  const scenes = globalsData.scenes.sort((a, b) => b.dateSaved - a.dateSaved);
  return response.json({ scenes, images: globalsData.images });
});

export const getProjectGlobals = ({ projectFolder }) => {
  const recentScenesAndImages = loadRecentScenesList({ projectFolder, loadImagesData: true });
  return recentScenesAndImages;
};

export default router;
