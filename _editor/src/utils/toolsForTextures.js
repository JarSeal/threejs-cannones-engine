import * as THREE from 'three';

import { getSceneItem, setSceneItem } from '../sceneData/sceneItems';
import { getSceneParam, setSceneParam } from '../sceneData/sceneParams';
import { DEFAULT_TEXTURE } from './defaultSceneValues';

export const createNewTexture = (id, name) => {
  const textures = getSceneParam('textures');
  const newTextureParams = { ...DEFAULT_TEXTURE, id, name };
  setSceneParam('textures', [...textures, newTextureParams]);
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
