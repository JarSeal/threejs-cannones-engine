import APP_CONFIG from '../../APP_CONFIG';

const ENV = process.env.NODE_ENV;
const PORT = APP_CONFIG.FS_PORT;
const PROJECTS_FOLDER_FROM_FS = (projectFolder) =>
  ENV === 'test'
    ? `./test/${APP_CONFIG.PROJECTS_FOLDER_NAME}/${projectFolder}`
    : `../${APP_CONFIG.PROJECTS_FOLDER_NAME}/${projectFolder}`;

const JSON_INDENTATION_VALUE = 2;

export default { ENV, PORT, PROJECTS_FOLDER_FROM_FS, JSON_INDENTATION_VALUE };
