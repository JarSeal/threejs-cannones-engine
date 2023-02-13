import { postRequest } from './utils/connect';

export const loadProjectGlobalsApi = async (props) => {
  const { projectFolder } = props;
  const response = await postRequest('projectGlobals', { projectFolder });
  if (response.error) return [];
  return response;
};
