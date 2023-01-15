import APP_CONFIG from '../../APP_CONFIG';

const ENV = process.env.NODE_ENV;
const PORT = APP_CONFIG.FS_PORT;
const PROJECTS_FOLDER_FROM_FS = (projectFolder) =>
  ENV === 'test' ? './test/Projects/' + projectFolder : '../Projects/' + projectFolder;

export default { ENV, PORT, PROJECTS_FOLDER_FROM_FS };
