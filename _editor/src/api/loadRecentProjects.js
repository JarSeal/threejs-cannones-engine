import { postRequest } from './utils/connect';

export const loadRecentProjectsApi = async (props) => {
  const { amount, returnErrors } = props;
  const response = await postRequest('recentProjects', { amount });
  if (!returnErrors && response.error) return [];
  return response;
};
