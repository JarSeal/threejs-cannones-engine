import APP_CONFIG from '../../APP_CONFIG';

const PORT = APP_CONFIG.FS_PORT;
const PROJECTS_FOLDER_FROM_FS = (projectFolder) => '../Projects/' + projectFolder;

export default { PORT, PROJECTS_FOLDER_FROM_FS };
