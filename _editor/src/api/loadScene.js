import { postRequest } from './utils/connect';

export const loadSceneApi = async (props) => {
  const { projectFolder, sceneId } = props;
  const response = await postRequest('loadScene', { projectFolder, sceneId });
  return response;
};
