import { postRequest } from './utils/connect';

export const loadRecentProjectsApi = async (props) => {
  const { amount } = props;
  const response = await postRequest('recentProjects', { amount });
  if (response.error) return [];
  return response;
};
