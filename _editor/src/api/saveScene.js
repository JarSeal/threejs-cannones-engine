import { postRequest } from './utils/connect';

export const saveSceneApi = async (sceneParams) => {
  const response = await postRequest('saveScene', sceneParams);
  return response;
};
