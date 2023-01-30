import fs from 'fs';

import APP_CONFIG from '../../APP_CONFIG';
import config, { getProjectFolderPath } from './config';

export const writeJsonFile = (path, data) => {
  // @TODO: add a third parameter for creating folders if they don't exist
  const indentation = config.JSON_INDENTATION_VALUE;
  fs.writeFileSync(path, JSON.stringify(data, null, indentation) + '\n', {
    encoding: 'utf8',
    flag: 'w',
  });
};

export const writeImageFile = (path, file) => {
  fs.writeFileSync(path, file);
};

export const updateProjectFile = (projectFolder, data) => {
  const folderPath = getProjectFolderPath(projectFolder);
  const projectFilePath = `${folderPath}/project.json`;

  const rawdata = fs.readFileSync(projectFilePath);
  const projectData = JSON.parse(rawdata);

  const indentation = config.JSON_INDENTATION_VALUE;
  fs.writeFileSync(
    projectFilePath,
    JSON.stringify({ ...projectData, ...data }, null, indentation) + '\n',
    {
      encoding: 'utf8',
      flag: 'w',
    }
  );
};

export const createFolder = (folderPath) => {
  fs.mkdirSync(folderPath, { recursive: true });
};

export const createProjectFolderStructure = (folderPath) => {
  const allFolderPaths = APP_CONFIG.SINGLE_PROJECT_CHILD_FOLDERS;
  for (let i = 0; i < allFolderPaths.length; i++) {
    const path = `${folderPath}/${allFolderPaths[i]}`;
    createFolder(path);
  }
};
