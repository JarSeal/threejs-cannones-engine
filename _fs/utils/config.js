import APP_CONFIG from '../../APP_CONFIG';

const ENV = process.env.NODE_ENV;
const PORT = APP_CONFIG.FS_PORT;
const PROJECTS_FOLDER_FROM_FS =
  ENV === 'test'
    ? `./test/${APP_CONFIG.PROJECTS_FOLDER_NAME}`
    : `../${APP_CONFIG.PROJECTS_FOLDER_NAME}`;

const JSON_INDENTATION_VALUE = 2;

export const getProjectFolderPath = (folder) => {
  let folderPath = folder ? `/${folder}` : '';
  return `${PROJECTS_FOLDER_FROM_FS}${folderPath}`;
};

export default { ENV, PORT, PROJECTS_FOLDER_FROM_FS, JSON_INDENTATION_VALUE };
