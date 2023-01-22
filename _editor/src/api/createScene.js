import { postRequest } from './utils/connect';

export const createSceneApi = async (sceneParams) => {
  const response = await postRequest('createScene', {
    projectFolder: sceneParams.projectFolder,
    sceneId: sceneParams.sceneId,
    sceneParams,
  });
  return response;
};
