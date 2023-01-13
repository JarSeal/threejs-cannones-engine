import { Router } from 'express';
import fs from 'fs';

import logger from '../utils/logger';
import config from '../utils/config';

const router = Router();

router.post('/', async (request, response) => {
  const { projectFolder, sceneId } = request.body;
  const path = `${config.PROJECTS_FOLDER_FROM_FS(projectFolder)}/_data/scenes/${sceneId}.json`;
  let data = {},
    errorMsg = null;
  try {
    const rawdata = fs.readFileSync(path);
    data = JSON.parse(rawdata);
  } catch (err) {
    errorMsg = `Error: Could not find scene file in "${path}"`; // @TODO: create an errors object
    logger.error(errorMsg, JSON.stringify(err));
    return response.json({ error: true, errorMsg });
  }
  response.json({ ...data, projectFolder });
});

export default router;
