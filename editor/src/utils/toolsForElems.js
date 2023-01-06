import { saveStateByKey } from '../sceneData/saveSession';
import { getSceneItem } from '../sceneData/sceneItems';
import { getSceneParam, setSceneParam } from '../sceneData/sceneParams';
import { updateCameraDefaultTransforms, updateCameraTransforms } from './toolsForCamera';
import { getObjectParams, isCameraObject } from './utils';

export const updateElemTransforms = (key, value, valueIndex, obj, args) => {
  if (typeof obj === 'string') {
    getSceneItem('scene').traverse((item) => {
      if (item.userData?.id === obj) obj = item;
    });
  }
  if (!obj) {
    console.warn(
      'Could not update elem transforms, "obj" property is missing or elem was not found in the scene.'
    );
    return;
  }
  if (typeof obj === 'string') {
    console.warn(
      `Could not update elem transforms, "obj" elem was not found in the scene with id "${obj}".`
    );
    return;
  }
  const isDefaultParameter = key.startsWith('default');

  if (isCameraObject(obj, true)) {
    // Camera targeting object
    const updateArgs = args ? { ...args, updateRightPanel: true } : { updateRightPanel: true };
    if (isDefaultParameter) {
      let posOrTar = 'position';
      if (key.includes('Target')) posOrTar = 'target';
      updateCameraDefaultTransforms(posOrTar, value, valueIndex, obj.userData.index, updateArgs);
    } else {
      updateCameraTransforms(key, value, valueIndex, obj.userData.index, updateArgs);
    }
  } else if (isCameraObject(obj)) {
    // Camera target object
    const updateArgs = args ? { ...args, updateRightPanel: true } : { updateRightPanel: true };
    if (isDefaultParameter) {
      updateCameraDefaultTransforms(
        'target',
        value,
        valueIndex,
        obj.userData.params.index,
        updateArgs
      );
    } else {
      updateCameraTransforms('target', value, valueIndex, obj.userData.params.index, updateArgs);
    }
  } else {
    // Regular elem
    const params = getObjectParams(obj);
    if (!params || params[key] === undefined || params[key][valueIndex] === undefined) {
      console.warn(
        `Could not find key "${key}" in value index "${valueIndex}" in object params`,
        obj
      );
      return;
    }
    const prevVal = params[key][valueIndex];
    const newVal = parseFloat(value);
    params[key][valueIndex] = newVal;
    const newElemParams = getSceneParam('elements').map((elem) => {
      if (elem.id === params.id) return params;
      return elem;
    });
    setSceneParam('elements', newElemParams);
    saveStateByKey('elements', newElemParams);
    obj.userData = params;
    if (!isDefaultParameter) {
      obj.position.set(...params.position);
      obj.rotation.set(...params.rotation);
      obj.scale.set(...params.scale);
    }
    getSceneItem('undoRedo').addAction({
      type: 'updateElemTransforms',
      prevVal,
      newVal,
      valueIndex,
      key,
      elemId: params.id,
      args,
    });
  }
};
