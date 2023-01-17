import APP_CONFIG from '../../../APP_CONFIG';

export const getFSUrl = (target) => {
  const baseUrl = `http://localhost:${APP_CONFIG.FS_PORT}`;
  switch (target) {
    case 'loadScene':
      return baseUrl + '/api/load-scene';
    case 'saveScene':
      return baseUrl + '/api/save-scene';
    case 'recentProjects':
      return baseUrl + '/api/projects-and-scenes-lists/recent-projects';
    case 'recentScenes':
      return baseUrl + '/api/projects-and-scenes-lists/recent-scenes';
    default:
      console.error(`The target param for getFSURL was unknown: ${target}`);
      return '';
  }
};
