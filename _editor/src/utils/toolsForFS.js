import { createSceneApi } from '../api/createScene';
import { saveSceneApi } from '../api/saveScene';
import { saveSceneState, unsetHasUnsavedChanges } from '../sceneData/saveSession';
import { getSceneItem } from '../sceneData/sceneItems';
import { getSceneParam, getSceneParams, setSceneParam } from '../sceneData/sceneParams';
import NewSceneDialog from '../UI/dialogs/NewScene';
import { changeScene } from './utils';

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
