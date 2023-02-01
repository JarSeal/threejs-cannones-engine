import { postRequest } from './utils/connect';

export const loadRecentScenesApi = async (props) => {
  const { amount, projectFolder, loadImagesData } = props;
  const response = await postRequest('recentScenes', { amount, projectFolder, loadImagesData });
  if (response.error) return [];
  return response;
};
