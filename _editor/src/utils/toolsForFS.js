import { saveSceneApi } from '../api/saveScene';
import { getSceneItem } from '../sceneData/sceneItems';
import { getSceneParams } from '../sceneData/sceneParams';

export const saveScene = async () => {
  const toaster = getSceneItem('toaster');
  const sceneParams = getSceneParams();
  delete sceneParams.editor;
  const response = await saveSceneApi(sceneParams);
  if (response.error) {
    toaster.addToast({
      type: 'error',
      content: response.errorMsg,
      delay: 0,
    });
  } else {
    toaster.addToast({
      type: 'success',
      content: 'Scene saved!',
    });
  }
};
