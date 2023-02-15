import * as THREE from 'three';
import { APP_DEFAULTS } from '../../../APP_CONFIG';
import { saveAllTexturesState, saveSceneState } from '../sceneData/saveSession';

import { getSceneItem, setSceneItem } from '../sceneData/sceneItems';
import { getSceneParam, setSceneParam } from '../sceneData/sceneParams';
import ConfirmationDialog from '../UI/dialogs/Confirmation';
import { DEFAULT_TEXTURE, MATERIAL_TEXTURE_KEYS } from './defaultSceneValues';
import { createTexture, setValueToSceneItem } from './utils';

// @TODO: change this to changeTextureParam (also for undo/redo) and add paramName parameter, and create a new texture every time
export const updateTextureImage = async ({
  textureId,
  imageId,
  prevImageId,
  targetItemKey,
  itemId,
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

  setValueToSceneItem({ targetItemKey, value: newTexture, itemId });

  saveAllTexturesState();
  getSceneItem('rightSidePanel').updatePanel();
  getSceneItem('elemTool').updateTool();
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
  const textureItem = getSceneItem('textures').find((tex) => tex.userData.id === textureId);
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

  setValueToSceneItem({ targetItemKey, value: newVal, itemId: textureId });
  textureItem.needsUpdate = true;

  saveAllTexturesState();
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

export const destroyTexture = (params, destroyWithoutDialogAndUndo) => {
  const removeTexture = () => {
    console.log('destroy texture', params);

    const prevValKeys = []; // This is used for the undo/redo
    const scene = getSceneItem('scene');

    // Remove root level param keys (scene.background)
    const backgroundTexId = getSceneParam('backgroundTexture');
    if (backgroundTexId === params.id) {
      setSceneParam('backgroundTexture', null);
      scene.background = null;
      prevValKeys.push({
        targetItemKey: 'scene.background',
        targetParamKey: 'backgroundTexture',
        itemId: null,
      });
      saveSceneState();
    }

    // Remove material params' textures and set prevValKeys (for undo)
    getSceneParam('materials', []).forEach((mat) => {
      MATERIAL_TEXTURE_KEYS.forEach((key) => {
        if (mat[key] === params.id) {
          mat[key] = null;
          prevValKeys.push({
            targetItemKey: 'materials.' + key,
            targetParamKey: 'materials.' + key,
            itemId: mat.id,
          });
        }
      });
    });
    // Remove material items' textures
    getSceneItem('materials', []).forEach((mat) => {
      MATERIAL_TEXTURE_KEYS.forEach((key) => {
        if (mat[key]?.userData?.id === params.id) {
          mat[key] = null;
        }
      });
    });

    // @TODO: remove possible spot light maps

    // Filter texture params
    const filteredParams = getSceneParam('textures').filter((tex) => tex.id !== params.id);
    setSceneParam('textures', filteredParams);

    // Filter texture items
    const filteredItems = getSceneItem('textures').filter((tex) => tex.userData !== params.id);
    setSceneItem('textures', filteredItems);

    saveAllTexturesState();
    getSceneItem('rightSidePanel').updatePanel();
    getSceneItem('elemTool').updateTool();

    // Add undo/redo action
    getSceneItem('undoRedo').addAction({
      type: 'destroyTexture',
      prevVal: { ...params, prevValKeys },
      newVal: params,
    });
  };
  if (!destroyWithoutDialogAndUndo) {
    const textureTextToDestroy = params.name ? `${params.name} (id: "${params.id})"` : params.id;
    getSceneItem('dialog').appear({
      component: ConfirmationDialog,
      componentData: {
        id: 'destroy-texture-dialog',
        confirmButtonClasses: ['confirmButtonDelete'],
        confirmButtonText: 'Destroy!',
        message: `Are you sure you want to destroy this texture completely: "${textureTextToDestroy}"? This will remove all references to this texture in the scene/materials. This will NOT, however, destroy the image used in this texture.`,
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

export const makeTextureGlobal = (params) => {
  console.log('Make texture global', params);

  params.global = true;

  // Remove from local textures
  const filteredTextureParams = getSceneParam('textures').filter((tex) => tex.id !== params.id);
  setSceneParam('textures', filteredTextureParams);

  // Update texture item userData
  const textureItem = getSceneItem('textures').find((tex) => tex.userData.id === params.id);
  textureItem.userData = params;

  // Add to global textures
  const globalTextures = getSceneParam('globalTextures');
  setSceneParam('globalTextures', [...globalTextures, params]);

  // Save all textures to LS
  saveAllTexturesState();

  // Update UI
  getSceneItem('rightSidePanel').updatePanel();
  getSceneItem('elemTool').updateTool();

  // Add undo/redo action
  getSceneItem('undoRedo').addAction({
    type: 'makeTextureGlobal',
    prevVal: { ...params, global: false },
    newVal: params,
  });
};

export const removeGlobalTexture = (params) => {
  // Only for undo (not to be used in UI)
  console.log('Remove global material', params);

  // Remove from global textures

  // Add to local textures
};

export default {
  updateTextureImage,
  updateTextureParam,
  destroyTexture,
  makeTextureGlobal,
  removeGlobalTexture,
};
