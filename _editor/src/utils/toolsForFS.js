import { saveSceneApi } from '../api/saveScene';
import { getSceneItem } from '../sceneData/sceneItems';
import { getSceneParams } from '../sceneData/sceneParams';

export const saveScene = async () => {
  const sceneParams = { ...getSceneParams() };
  delete sceneParams.editor;
  const response = await saveSceneApi(sceneParams);
  if (!response.error) {
    getSceneItem('toaster').addToast({
      type: 'success',
      content: 'Scene saved!',
    });
  }
};
