import { Router } from 'express';

import APP_CONFIG from '../../APP_CONFIG';
import { getProjectFolderPath } from '../utils/config';
import { getError } from '../utils/errors';
import logger from '../utils/logger';
import { validateProjectFolder } from '../utils/validation';
import { createFolder, writeImageFile } from '../utils/writeFile';

const router = Router();

router.post('/', async (request, response) => {
  const data = saveImageData(request.files, request.body);
  return response.json(data);
});

export const saveImageData = (imageFile, imageParams) => {
  console.log('imageParams', imageParams);
  console.log('imageFile', imageFile);

  if (!imageFile.file) {
    const error = getError('noImageFileUploaded');
    logger.error(error.errorMsg, imageParams);
    return { ...error, error: true, imageParams };
  }

  const folderPath = getProjectFolderPath(imageParams.projectFolder);
  const imageFilesFolder = `${folderPath}/${APP_CONFIG.SINGLE_PROJECT_IMAGES_FOLDER}/${imageParams.id}`;
  const imageFilePath = `${imageFilesFolder}/${imageParams.fileName}`;

  const validation = validateProjectFolder(imageParams.projectFolder);
  if (validation.error) {
    logger.error(validation.errorMsg);
    return { error: true, ...validation };
  }

  try {
    createFolder(imageFilesFolder);
    writeImageFile(imageFilePath, imageFile.file.data);
  } catch (err) {
    const error = getError('couldNotWriteImageFile', { path: imageFilePath });
    logger.error(error.errorMsg, err, imageParams);
    return { ...error, error: true, imageParams };
  }

  // @TODO: update images.json (and load and combine the images json data with the project.json load)

  return { imageUploaded: true, imageParams };
};

export default router;
