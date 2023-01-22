import { postRequest } from './utils/connect';

export const loadRecentScenesApi = async (props) => {
  const { amount, projectFolder } = props;
  const response = await postRequest('recentScenes', { amount, projectFolder });
  if (response.error) return [];
  return response;
};
