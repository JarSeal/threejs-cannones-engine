import APP_CONFIG from '../../../APP_CONFIG';

export const getFSUrl = (target) => {
  const baseUrl = `http://localhost:${APP_CONFIG.FS_PORT}`;
  switch (target) {
    case 'loadScene':
      return baseUrl + '/api/load-scene';
    default:
      console.error(`The target param for getFSURL was unknown: ${target}`);
      return '';
  }
};
