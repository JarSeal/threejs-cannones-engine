import fs from 'fs';

import APP_CONFIG from '../../APP_CONFIG';
import config from '../utils/config';
import { writeJsonFile } from '../utils/writeFile';
import { initTestData } from './initTestData';

const globalSetup = () => {
  console.log('\nSetup test data');

  const baseFolder = config.PROJECTS_FOLDER_FROM_FS('').slice(0, -1);

  // Create base "Projects" folder
  if (!fs.existsSync(baseFolder)) {
    fs.mkdirSync(baseFolder);
  }

  initTestData.forEach((proj) => {
    const folderPath = config.PROJECTS_FOLDER_FROM_FS(proj.projectFolder);

    // Create project's folders (if they don't exist)
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath);
    }
    APP_CONFIG.SINGLE_PROJECT_CHILD_FOLDERS.forEach((folder) => {
      const splitPaths = folder.split('/');
      let fullPath = folderPath;
      splitPaths.forEach((path) => {
        fullPath += `/${path}`;
        if (!fs.existsSync(fullPath)) {
          fs.mkdirSync(fullPath);
        }
      });
    });

    // Create project.json file (the root file)
    writeJsonFile(`${folderPath}/project.json`, {
      projectFolder: proj.projectFolder,
      rootScene: proj.rootScene,
    });

    // Create scene files
    proj.scenes.forEach((scn) => {
      writeJsonFile(
        `${folderPath}/${APP_CONFIG.SINGLE_PROJECT_SCENE_FILES_FOLDER}/${scn.sceneId}.json`,
        scn
      );
    });
  });

  console.log('Setup complete');
};

export default globalSetup;
