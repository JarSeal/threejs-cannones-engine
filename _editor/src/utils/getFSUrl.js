import APP_CONFIG from '../../../APP_CONFIG';

export const getFSUrl = (target) => {
  const baseUrl = `http://localhost:${APP_CONFIG.FS_PORT}`;
  switch (target) {
    case 'createProject':
      return baseUrl + '/api/create-project';
    case 'createScene':
      return baseUrl + '/api/create-scene';
    case 'deleteScene':
      return baseUrl + '/api/delete-scene';
    case 'loadScene':
      return baseUrl + '/api/load-scene';
    case 'recentProjects':
      return baseUrl + '/api/projects-and-scenes-lists/recent-projects';
    case 'recentScenes':
      return baseUrl + '/api/projects-and-scenes-lists/recent-scenes';
    case 'saveScene':
      return baseUrl + '/api/save-scene';
    case 'uploadImage':
      return baseUrl + '/api/upload-image';
    default:
      console.error(`The target param for getFSURL was unknown: ${target}`);
      return '';
  }
};
