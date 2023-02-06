import * as THREE from 'three';
import { APP_DEFAULTS } from '../../../APP_CONFIG';
import { saveAllTexturesState } from '../sceneData/saveSession';

import { getSceneItem, setSceneItem } from '../sceneData/sceneItems';
import { getSceneParam, setSceneParam } from '../sceneData/sceneParams';
import ConfirmationDialog from '../UI/dialogs/Confirmation';
import { DEFAULT_TEXTURE } from './defaultSceneValues';
import { createTexture, setValueToSceneItem } from './utils';

// @TODO: change this to changeTextureParam (also for undo/redo) and add paramName parameter, and create a new texture every time
export const updateTextureImage = async ({
  textureId,
  imageId,
  prevImageId,
  targetItemKey,
  itemIndex,
}) => {
  const textureParams = getSceneParam('textures').find((tex) => tex.id === textureId);
  if (!textureParams) {
    const errorMsg = `${APP_DEFAULTS.APP_NAME}: Could not find textureParams for texture ID "${textureId}".`;
    console.error(errorMsg);
    getSceneItem('toaster').addToast({
      type: 'error',
      delay: 0,
      content: errorMsg,
    });
    return;
  }
  const prevVal = {
    textureId,
    imageId: prevImageId,
    targetItemKey,
  };

  const newTexture = createTexture({ ...textureParams, image: imageId });

  // Set texture items
  const filteredItems = getSceneItem('textures').filter((item) => item.userData.id !== textureId);
  setSceneItem('textures', [...filteredItems, newTexture]);

  // Set texture params
  const filteredParams = getSceneParam('textures').filter((param) => param.id !== textureId);
  setSceneParam('textures', [...filteredParams, { ...textureParams, image: imageId }]);

  setValueToSceneItem({ targetItemKey, value: newTexture, itemIndex });

  saveAllTexturesState();
  getSceneItem('rightSidePanel').updatePanel();
  getSceneItem('undoRedo').addAction({
    type: 'updateTextureImage',
    prevVal,
    newVal: {
      textureId,
      imageId,
      targetItemKey,
    },
  });
};

export const updateTextureParam = ({
  textureId,
  params,
  targetItemKey,
  targetParamKey,
  newVal,
  prevVal,
}) => {
  let textureItemIndex;
  const textureItem = getSceneItem('textures').find((tex, index) => {
    textureItemIndex = index;
    return tex.userData.id === textureId;
  });
  if (!textureItem) {
    const errorMsg = `${APP_DEFAULTS.APP_NAME}: Could not find textureItem for texture ID "${textureId}".`;
    console.error(errorMsg);
    getSceneItem('toaster').addToast({
      type: 'error',
      delay: 0,
      content: errorMsg,
    });
    return;
  }

  // Set texture params
  const filteredParams = getSceneParam('textures').filter((param) => param.id !== textureId);
  setSceneParam('textures', [...filteredParams, { ...params, [targetParamKey]: newVal }]);

  setValueToSceneItem({ targetItemKey, value: newVal, itemIndex: textureItemIndex });
  textureItem.needsUpdate = true;

  saveAllTexturesState();
  getSceneItem('rightSidePanel').updatePanel();
  const prevParams = { ...params, [targetParamKey]: prevVal };
  getSceneItem('undoRedo').addAction({
    type: 'updateTextureParam',
    prevVal: {
      textureId,
      params: prevParams,
      targetItemKey,
      targetParamKey,
      newVal: prevVal,
      prevVal: newVal,
    },
    newVal: { textureId, params, targetItemKey, targetParamKey, newVal, prevVal },
  });
};

export const createNewTexture = (id, name) => {
  const textures = getSceneParam('textures');
  const newTextureParams = { ...DEFAULT_TEXTURE, id, name };
  setSceneParam('textures', [...textures, newTextureParams]);
  saveAllTexturesState();
  const newTextureItem = new THREE.Texture();
  newTextureItem.flipY = DEFAULT_TEXTURE.flipY;
  newTextureItem.wrapS = DEFAULT_TEXTURE.wrapS;
  newTextureItem.wrapT = DEFAULT_TEXTURE.wrapT;
  newTextureItem.repeating = new THREE.Vector2(
    DEFAULT_TEXTURE.wrapSTimes,
    DEFAULT_TEXTURE.wrapTTimes
  );
  newTextureItem.offset = new THREE.Vector2(DEFAULT_TEXTURE.offsetU, DEFAULT_TEXTURE.offsetV);
  newTextureItem.center = new THREE.Vector2(DEFAULT_TEXTURE.centerU, DEFAULT_TEXTURE.centerV);
  newTextureItem.rotation = DEFAULT_TEXTURE.rotation;
  newTextureItem.userData = newTextureParams;
  const textureItems = getSceneItem('textures');
  setSceneItem('textures', [...textureItems, newTextureItem]);
};

export const deleteTexture = (id) => {
  console.log('deleteTexture', id);
};

export const destroyTexture = (params, destroyWithoutDialogAndUndo) => {
  const removeTexture = () => {
    console.log('destroy texture');
  };
  if (!destroyWithoutDialogAndUndo) {
    const textureTextToDestroy = params.name ? `${params.name} (id: "${params.id})"` : params.id;
    getSceneItem('dialog').appear({
      component: ConfirmationDialog,
      componentData: {
        id: 'destroy-texture-dialog',
        confirmButtonClasses: ['confirmButtonDelete'],
        confirmButtonText: 'Destroy!',
        message: `Are you sure you want to destroy this texture completely: ${textureTextToDestroy}? This will NOT destroy the image used in this texture.`,
        confirmButtonFn: () => {
          removeTexture();
          getSceneItem('dialog').disappear();
        },
      },
      title: 'Are you sure?',
    });
  } else {
    removeTexture();
  }
};

export default {
  updateTextureImage,
  updateTextureParam,
  destroyTexture,
};
