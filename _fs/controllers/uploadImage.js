import { Router } from 'express';
import sizeOf from 'image-size';

import APP_CONFIG from '../../APP_CONFIG';
import { getProjectFolderPath } from '../utils/config';
import { getError } from '../utils/errors';
import logger from '../utils/logger';
import { validateProjectFolder } from '../utils/validation';
import { createFolder, updateAllImagesData, writeImageFile } from '../utils/writeFile';

const router = Router();

router.post('/', async (request, response) => {
  const data = saveImageData(request.files, request.body);
  return response.json(data);
});

export const saveImageData = (imageFile, imageParams) => {
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
    // Copy file to images/[imageId] folder
    createFolder(imageFilesFolder);
    writeImageFile(imageFilePath, imageFile.file.data);
  } catch (err) {
    const error = getError('couldNotWriteImageFile', { path: imageFilePath });
    logger.error(error.errorMsg, err, imageParams);
    return { ...error, error: true, imageParams };
  }

  try {
    // Update all images file
    const timeNow = new Date().getTime();
    const dimensions = sizeOf(imageFile.file.data);
    const splitFilename = imageParams.fileName.split('.');
    imageParams.type = dimensions?.type || splitFilename[splitFilename.length - 1];
    imageParams.dateSaved = timeNow;
    imageParams.dimensions = {
      width: dimensions?.width || 0,
      height: dimensions?.height || 0,
    };
    updateAllImagesData(imageParams.projectFolder, imageParams);
  } catch (err) {
    const error = getError('couldNotUpdateAllImagesFile');
    logger.error(error.errorMsg, err, imageParams);
    return { ...error, error: true, imageParams };
  }

  return { imageUploaded: true, imageParams };
};

export default router;
