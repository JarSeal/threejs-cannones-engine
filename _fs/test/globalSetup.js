import fs from 'fs';

import APP_CONFIG from '../../APP_CONFIG';
import { getProjectFolderPath } from '../utils/config';
import { createProjectFolderStructure, writeJsonFile } from '../utils/writeFile';
import { initTestData } from './initTestData';
import { removeTestProjectsFolder } from './util';

const globalSetup = () => {
  console.log('\nSetup test data');

  const baseFolder = getProjectFolderPath();

  // Remove possible test "Projects" folder
  removeTestProjectsFolder();

  // Create base "Projects" folder
  if (!fs.existsSync(baseFolder)) {
    fs.mkdirSync(baseFolder);
  }

  initTestData.forEach((proj) => {
    const folderPath = getProjectFolderPath(proj.projectFolder);

    // Create project's folders
    createProjectFolderStructure(folderPath);

    // Create project.json file (the root file)
    writeJsonFile(`${folderPath}/project.json`, {
      projectFolder: proj.projectFolder,
      rootScene: proj.rootScene,
      name: proj.name || '',
      dateCreated: 1663229534337,
      dateSaved: 1673976003949,
      scenes: proj.scenes,
    });

    // Create scene files
    proj.scenesData.forEach((scn) => {
      writeJsonFile(
        `${folderPath}/${APP_CONFIG.SINGLE_PROJECT_SCENE_FILES_FOLDER}/${scn.sceneId}.json`,
        scn
      );
    });
  });

  console.log('Setup complete');
};

export default globalSetup;
