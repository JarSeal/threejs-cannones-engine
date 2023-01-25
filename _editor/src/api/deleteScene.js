import { postRequest } from './utils/connect';

export const deleteSceneApi = async (projectFolder, sceneId) => {
  const response = await postRequest('deleteScene', { projectFolder, sceneId });
  return response;
};
