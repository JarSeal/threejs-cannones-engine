import { postRequest } from './utils/connect';

export const createProjectApi = async (params) => {
  const response = await postRequest('createProject', params);
  return response;
};
