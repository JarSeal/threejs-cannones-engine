import fs from 'fs';

import config from './config';

export const writeJsonFile = (path, data) => {
  const indentation = config.JSON_INDENTATION_VALUE;
  fs.writeFileSync(path, JSON.stringify(data, null, indentation) + '\n', {
    encoding: 'utf8',
    flag: 'w',
  });
};

export const updateProjectFile = (projectFolder, data) => {
  const folderPath = config.PROJECTS_FOLDER_FROM_FS(projectFolder);
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
