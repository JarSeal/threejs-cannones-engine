import { saveSceneApi } from '../api/saveScene';
import { getSceneParams } from '../sceneData/sceneParams';

export const saveScene = async () => {
  const response = await saveSceneApi(getSceneParams());
  // @TODO: add toast to notify user about successfull save or error
  if (response.error) {
    console.log(response);
  } else {
    console.log('SCENE SAVED...', response);
  }
};
