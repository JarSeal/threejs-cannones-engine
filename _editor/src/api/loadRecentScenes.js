import { postRequest } from './utils/connect';

export const loadRecentScenesApi = async (props) => {
  const { amount } = props;
  const response = await postRequest('recentScenes', { amount });
  if (response.error) return [];
  return response;
};
