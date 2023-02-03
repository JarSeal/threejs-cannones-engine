import { createSceneApi } from '../api/createScene';
import { saveSceneApi } from '../api/saveScene';
import { uploadImageApi } from '../api/uploadImage';
import { saveSceneState, unsetHasUnsavedChanges } from '../sceneData/saveSession';
import { getSceneItem } from '../sceneData/sceneItems';
import { getSceneParam, getSceneParams, setSceneParam } from '../sceneData/sceneParams';
import DeleteSceneDialog from '../UI/dialogs/DeleteScene';
import NewSceneDialog from '../UI/dialogs/NewScene';
import { changeScene } from './utils';

export const saveScene = async () => {
  const sceneParams = { ...getSceneParams() };
  delete sceneParams.editor;
  delete sceneParams.images;
  delete sceneParams.cubemaps; // @TODO: check if this is actually the param to be used (writing this when this hasn't been implemented yet)
  const response = await saveSceneApi(sceneParams);
  if (!response.error) {
    getSceneItem('toaster').addToast({
      type: 'success',
      content: 'Scene saved!',
    });
  }
  unsetHasUnsavedChanges();
};

export const createNewScene = async (sceneParams) => {
  const response = await createSceneApi(sceneParams);
  if (!response.error) {
    getSceneItem('toaster').addToast({
      type: 'success',
      content: 'Scene created!',
    });
    changeScene(sceneParams.projectFolder, sceneParams.sceneId);
  }
};

export const newSceneDialog = () =>
  getSceneItem('dialog').appear({
    component: NewSceneDialog,
    title: 'Add new scene',
  });

export const deleteSceneDialog = (projectFolder, sceneId) =>
  getSceneItem('dialog').appear({
    component: DeleteSceneDialog,
    componentData: { projectFolder, sceneId },
    title: 'Delete scene',
  });

export const updateSceneName = (newVal) => {
  const prevVal = getSceneParam('name');
  setSceneParam('name', newVal);
  saveSceneState({ name: newVal });
  getSceneItem('rightSidePanel').updatePanel();
  getSceneItem('undoRedo').addAction({
    type: 'updateSceneName',
    prevVal,
    newVal,
  });
};

export const uploadImage = async (params) => {
  const response = await uploadImageApi(params);
  if (!response.error) {
    getSceneItem('toaster').addToast({
      type: 'success',
      content: 'Image imported to project!',
    });
  }
  return response;
};
