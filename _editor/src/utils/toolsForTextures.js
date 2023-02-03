import * as THREE from 'three';
import { APP_DEFAULTS } from '../../../APP_CONFIG';
import { saveAllTexturesState, saveSceneState } from '../sceneData/saveSession';

import { getSceneItem, setSceneItem } from '../sceneData/sceneItems';
import { getSceneParam, setSceneParam } from '../sceneData/sceneParams';
import { DEFAULT_TEXTURE } from './defaultSceneValues';
import { createTexture } from './utils';

// @TODO: change this to changeTextureParam (also for undo/redo) and add paramName parameter, and create a new texture every time
export const updateTextureImage = async ({ textureId, imageId, prevImageId, targetItemKey }) => {
  let errorMsg;
  const textureParams = getSceneParam('textures').find((tex) => tex.id === textureId);
  if (!textureParams) {
    errorMsg = `${APP_DEFAULTS.APP_NAME}: Could not find textureParams for texture ID "${textureId}".`;
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

  if (targetItemKey) {
    // @TODO: move this to utils
    const splitTargets = targetItemKey.split('.');
    const sceneItem = getSceneItem(splitTargets[0]);
    if (Array.isArray(sceneItem)) {
      // @TODO: parseInt the splitTargets[1]
    } else {
      if (splitTargets.length === 2) {
        sceneItem[splitTargets[1]] = newTexture;
      } else if (splitTargets.length === 3) {
        sceneItem[splitTargets[1]][splitTargets[2]] = newTexture;
      } else if (splitTargets.length === 4) {
        sceneItem[splitTargets[1]][splitTargets[2]][splitTargets[3]] = newTexture;
      } else if (splitTargets.length === 5) {
        sceneItem[splitTargets[1]][splitTargets[2]][splitTargets[3]][splitTargets[4]] = newTexture;
      } else if (splitTargets.length === 6) {
        sceneItem[splitTargets[1]][splitTargets[2]][splitTargets[3]][splitTargets[4]][
          splitTargets[5]
        ] = newTexture;
      } else if (splitTargets.length === 7) {
        sceneItem[splitTargets[1]][splitTargets[2]][splitTargets[3]][splitTargets[4]][
          splitTargets[5]
        ][splitTargets[6]] = newTexture;
      } else {
        errorMsg = `${APP_DEFAULTS.APP_NAME}: targetItemKey not valid ("${targetItemKey}").`;
        console.error(errorMsg);
        getSceneItem('toaster').addToast({
          type: 'error',
          delay: 0,
          content: errorMsg,
        });
        return;
      }
    }
  }
  saveSceneState();
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

export const updateTextureParam = () => {
  // @TODO: implement this by only changing the texture item values (should do the trick), and also update the sceneParams('textures')
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

export default {
  updateTextureImage,
};
